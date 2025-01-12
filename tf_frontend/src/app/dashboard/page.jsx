'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [allRecipes, setAllRecipes] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndRecipes = async () => {
      try {
        // Check user authentication
        const userResponse = await fetch('http://localhost:5000/auth/check', {
          method: 'GET',
          credentials: 'include',
        });
        const userData = await userResponse.json();

        if (!userData.valid) {
          router.push('/login?error=invalid_session');
          return;
        }

        // Set user data
        setUser({
          name: userData.user.name,
          email: userData.user.email,
          picture: userData.user.picture || '/default-avatar.png',
        });

        // Fetch recipes from `/recipes`
        const recipeResponse = await fetch('http://localhost:5000/api/recipes', {
          method: 'GET',
          credentials: 'include',
        });

        if (!recipeResponse.ok) throw new Error('Failed to fetch recipes');

        const recipeData = await recipeResponse.json();

        // Set recipes for display and suggestions
        setAllRecipes(recipeData);
        setRecipes(recipeData.slice(0, 6)); // Show initial recipes
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRecipes();
  }, [router]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter recipes based on search query
    const filteredRecipes = allRecipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(query)
    );
    setRecipes(filteredRecipes.slice(0, 6));
  };

  const handleViewRecipe = (recipeId) => {
    router.push(`/foodview/users/${recipeId}`); // Redirect to user's recipe page
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', padding: 5 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&auto=format&fit=crop&q=60)',
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
          placeholder="Search Recipes"
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
      {/* Recipes */}
      <Box sx={{ padding: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 3 }}>
          Recommended Recipes
        </Typography>
        <Grid container spacing={3}>
          {recipes.map((recipe) => (
            <Grid item xs={12} sm={6} md={4} key={recipe.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={recipe.cover_image || 'https://via.placeholder.com/400'}
                  alt={recipe.name}
                />
                <CardContent>
                  <Typography variant="h6">{recipe.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {recipe.likes || 0} Likes <br />
                    {recipe.comments?.length || 0} Comments
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary" onClick={() => handleViewRecipe(recipe.id)}>
                    View Recipe
                  </Button>
                  <Button size="small" color="primary">
                    Rating: {recipe.average_rating || 0} ⭐
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

export default Dashboard;
