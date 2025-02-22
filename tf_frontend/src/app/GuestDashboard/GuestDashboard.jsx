'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

const GuestDashboard = () => {
  const [allRecipes, setAllRecipes] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState('');
  const heroImages = [
    'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8VGhhaWZvb2R8ZW58MHx8MHx8fDA%3D',
  ];

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (data.valid) {
          // Redirect valid users to the dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };

    checkAuth();

    // Set a random hero image
    const randomImage = heroImages[Math.floor(Math.random() * heroImages.length)];
    setHeroImage(randomImage);

    // Fetch recipes
    const fetchRecipes = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/based/recipes`);

        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }

        const data = await response.json();

        const recipesWithIds = data.map((recipe) => ({
          ...recipe,
          id: uuidv4(),
        }));

        setAllRecipes(recipesWithIds);
        localStorage.setItem('allRecipes', JSON.stringify(recipesWithIds));
        setRecipes(recipesWithIds.slice(0, 6)); // Show the first 6 recipes
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [router]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filteredRecipes = allRecipes.filter((recipe) =>
      recipe.recipeName.toLowerCase().includes(query)
    );
    setRecipes(filteredRecipes.slice(0, 6)); // Show the first 6 results
  };

  const handleViewRecipe = (recipe) => {
    if (!recipe) {
      console.error('Invalid recipe data:', recipe);
      return;
    }

    localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
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
                    {recipe.likes || 0} Likes
                    <br />
                    {recipe.comments || 0} Comments
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary" onClick={() => handleViewRecipe(recipe)}>
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
