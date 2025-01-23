'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import StarRateIcon from '@mui/icons-material/StarRate';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import { useRouter } from 'next/navigation';

const RecipeDetailPage = () => {
  const [recipe, setRecipe] = useState(null); // Recipe data
  const [relatedRecipes, setRelatedRecipes] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog state

  const router = useRouter(); // Initialize useRouter

  const handleViewRecipe = (recipe) => {
    if (!recipe) {
      console.error("Invalid recipe data:", recipe);
      return;
    }

    // Save the recipe data to localStorage or sessionStorage
    localStorage.setItem('selectedRecipe', JSON.stringify(recipe));

    // Navigate to the next page
    router.push(`/foodview/guests/${recipe.id}`);
  };

  // Open the dialog
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  useEffect(() => {
    console.log('Fetching data from localStorage...');
    const storedRecipe = localStorage.getItem('selectedRecipe');
    const storedAllRecipes = localStorage.getItem('allRecipes');

    if (storedRecipe) {
      console.log('Selected Recipe:', JSON.parse(storedRecipe));
      setRecipe(JSON.parse(storedRecipe));
    }

    if (storedAllRecipes) {
      console.log('All Recipes:', JSON.parse(storedAllRecipes));
      const allRecipes = JSON.parse(storedAllRecipes);

      if (allRecipes.length > 0) {
        const shuffledRecipes = allRecipes.sort(() => 0.5 - Math.random());
        console.log('Shuffled Recipes:', shuffledRecipes);
        setRelatedRecipes(shuffledRecipes.slice(0, 4)); // Pick 4 random recipes
        console.log('Related Recipes:', shuffledRecipes.slice(0, 4));
      } else {
        console.log('No recipes available in allRecipes.');
      }
    }
  }, []);

  // Show error message if no recipe found
  if (!recipe) {
    return (
      <Typography variant="h6" sx={{ textAlign: 'center', marginTop: '2rem' }}>
        No recipe found.
      </Typography>
    );
  }

  return (
    <Box sx={{ padding: '2rem', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {recipe.recipeName || 'Unnamed Recipe'}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Thaifoods, Mar 16, 2022
        </Typography>
      </Box>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Recipe Image */}
        <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            image={recipe.imageURL || 'https://via.placeholder.com/800x400'}
            alt={recipe.recipeName || 'Recipe Image'}
            sx={{ borderRadius: '8px', boxShadow: 1 }}
          />
        </Grid>

        {/* Recipe Details */}
        <Grid item xs={12} md={6}>
          {/* Ratings and Likes */}
          <Box sx={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <StarRateIcon sx={{ color: '#FFD700' }} />
            <Typography variant="subtitle1">- / 5</Typography>
            <Button startIcon={<ThumbUpIcon />} variant="outlined" size="small" onClick={handleOpenDialog}>
              Like {recipe.likes || 0}
            </Button>
            <Button startIcon={<CommentIcon />} variant="outlined" size="small" onClick={handleOpenDialog}>
              Comment {recipe.comments || 0}
            </Button>
          </Box>

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <Box sx={{ backgroundColor: '#d9f8d9', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                วัตถุดิบ
              </Typography>
              <ul>
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    <Typography variant="body1">{ingredient}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
          )}

          {/* Instructions */}
          {recipe.instructions && recipe.instructions.length > 0 && (
            <Box sx={{ backgroundColor: '#d9f8d9', padding: '1rem', borderRadius: '8px' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                วิธีการทำ
              </Typography>
              <ol>
                {recipe.instructions.map((step, index) => (
                  <li key={index}>
                    <Typography variant="body1">{step}</Typography>
                  </li>
                ))}
              </ol>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Comment Section */}
      <Box sx={{ marginTop: '2rem', backgroundColor: '#e9e9e9', padding: '1.5rem', borderRadius: '8px' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '1rem' }}>
          แสดงความคิดเห็น
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="เขียนความคิดเห็นของคุณ..."
          variant="outlined"
          sx={{ marginBottom: '1rem' }}
          onClick={handleOpenDialog}
        />
        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          ส่งความคิดเห็น
        </Button>
      </Box>

      {/* Related Recipes Section */}
      {relatedRecipes && relatedRecipes.length > 0 && (
        <Box sx={{ marginTop: '2rem' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '1rem' }}>
            เมนูที่น่าสนใจ
          </Typography>
          <Grid container spacing={2}>
            {relatedRecipes.map((related, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ maxWidth: '100%', textAlign: 'center' }}>
                  <CardMedia
                    component="img"
                    image={related.imageURL || 'https://via.placeholder.com/200'}
                    alt={related.recipeName || 'Related Recipe'}
                    sx={{ height: 140 }}
                  />
                  <CardContent>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {related.recipeName || 'No Title'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Rating: {related.rating || "-"} / 5
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {/* Use handleViewRecipe to navigate */}
                    <Button size="small" onClick={() => handleViewRecipe(related)}>
                      ดูสูตรอาหาร
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Dialog for Restricted Actions */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>ฟังก์ชันนี้ใช้ได้เฉพาะผู้ใช้งานที่ลงทะเบียน</DialogTitle>
        <DialogContent>
          <DialogContentText>
            หากคุณต้องการใช้งานฟังก์ชันนี้ กรุณาลงทะเบียนหรือลงชื่อเข้าใช้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ปิด</Button>
          <Button onClick={() => router.push('/login')} color="primary" variant="contained">
            ลงชื่อเข้าใช้
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecipeDetailPage;