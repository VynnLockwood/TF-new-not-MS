'use client';

import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';


const GuestDashboard = () => {
  const [allRecipes, setAllRecipes] = useState([]); // Store all recipes
  const [recipes, setRecipes] = useState([]); // Displayed recipes
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const heroImages = [
    // Array of hero images
    'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8VGhhaWZvb2R8ZW58MHx8MHx8fDA%3D',
    // Add other image URLs here
  ];
  const [heroImage, setHeroImage] = useState('');

  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    setHeroImage(heroImages[Math.floor(Math.random() * heroImages.length)]); // Random image on render

    const fetchRecipes = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/based/recipes`);
    
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
    
        const data = await response.json();
    
        // Add unique IDs to recipes
        const recipesWithIds = data.map((recipe) => ({
          ...recipe,
          id: uuidv4(), // Generate a unique ID
        }));
    
        setAllRecipes(recipesWithIds); // Store recipes with IDs
        localStorage.setItem('allRecipes', JSON.stringify(recipesWithIds));
        setRecipes(recipesWithIds.slice(0, 6)); // Show first 6 recipes
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filteredRecipes = allRecipes.filter((recipe) =>
      recipe.recipeName.toLowerCase().includes(query)
    );
    setRecipes(filteredRecipes.slice(0, 6)); // Display first 6 matching recipes
  };

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
  
  

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', padding: 5 }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* App Bar
      <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <img
              src="https://i.postimg.cc/sX2ntz2w/Wok-Asian-Food-Logo.png"
              alt="Thai Foods Logo"
              style={{ height: '40px', marginRight: '16px' }}
            />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              THAI FOODS
            </Typography>
          </Box>
          <Box display="flex" gap={3}>
            <Button href="/login">สร้างสูตรอาหารของคุณ</Button>
            <Button href="/login">เข้าสู่ระบบ</Button>
          </Box>
        </Toolbar>
      </AppBar> */}

      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '300px',
        }}
      />

      {/* Search Field */}
      <Box sx={{ padding: 3, textAlign: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="ค้นหาสูตรอาหาร"
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            endAdornment: (
              <IconButton>
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      </Box>

      {/* Recommended Recipes */}
      <Box sx={{ padding: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 3 }}>
          สูตรอาหารที่แนะนำ!
        </Typography>
        <Grid container spacing={3}>
          {recipes.map((recipe, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ maxWidth: 345 }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={recipe.imageURL || 'https://via.placeholder.com/150'}
                  alt={recipe.recipeName}
                />
                <CardContent>
                  <Typography variant="h6">{recipe.recipeName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {recipe.likes || 0} Like
                    <br />
                    {recipe.comments || 0} Comment
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleViewRecipe(recipe)}
                  >
                    View
                  </Button>
                  <Button size="small" color="primary">
                    Rate: {recipe.rating || 0} ⭐
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default GuestDashboard;
