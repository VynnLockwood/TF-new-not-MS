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
  Avatar,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

const Dashboard = () => {
  const [user, setUser] = useState(null); // Logged-in user details
  const [allRecipes, setAllRecipes] = useState([]); // Store all recipes
  const [recipes, setRecipes] = useState([]); // Displayed recipes
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState('');

  const router = useRouter();

  const heroImages = [
    'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&auto=format&fit=crop&q=60',
    // Add more image URLs if needed
  ];

  useEffect(() => {
    setHeroImage(heroImages[Math.floor(Math.random() * heroImages.length)]);

    const fetchUserAndRecipes = async () => {
      try {
        // Check user session
        const userResponse = await fetch('http://localhost:5000/auth/check', {
          method: 'GET',
          credentials: 'include',
        });
        const userData = await userResponse.json();
        if (userData.valid) {
          setUser({
            name: userData.user.name,
            email: userData.user.email,
            picture: userData.user.picture || '/default-avatar.png',
          });
        } else {
          router.push('/login?error=invalid_session');
          return;
        }

        // Fetch recipes
        const recipeResponse = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/based/recipes`);
        if (!recipeResponse.ok) throw new Error('Failed to fetch recipes');
        const recipeData = await recipeResponse.json();

        const recipesWithIds = recipeData.map((recipe) => ({
          ...recipe,
          id: uuidv4(),
        }));

        setAllRecipes(recipesWithIds);
        localStorage.setItem('allRecipes', JSON.stringify(recipesWithIds));
        setRecipes(recipesWithIds.slice(0, 6));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRecipes();
  }, [router]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filteredRecipes = allRecipes.filter((recipe) =>
      recipe.recipeName.toLowerCase().includes(query)
    );
    setRecipes(filteredRecipes.slice(0, 6));
  };

  const handleViewRecipe = (recipe) => {
    if (!recipe) return;

    localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
    router.push(`/foodview/guests/${recipe.id}`);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } catch {
      router.push('/login');
    }
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

export default Dashboard;
