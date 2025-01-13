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
  CircularProgress,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
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

        // Fetch recipes, tags, and categories
        const recipeResponse = await fetch('http://localhost:5000/api/recipes', {
          method: 'GET',
          credentials: 'include',
        });

        if (!recipeResponse.ok) throw new Error('Failed to fetch recipes');

        const { recipes: fetchedRecipes, tags: fetchedTags, categories: fetchedCategories } =
          await recipeResponse.json();

        // Update state with API response
        setRecipes(fetchedRecipes.slice(0, 6)); // Show initial recipes
        setTags(fetchedTags || []);
        setCategories(fetchedCategories || []);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRecipes();
  }, [router]);

  const handleSearchClick = async () => {
    if (!searchQuery.trim() && !selectedCategory) {
      setRecipes([]); // Reset recipes if no search query or category
      return;
    }

    setSearching(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/recipes?${new URLSearchParams({
          query: searchQuery,
          category: selectedCategory,
        }).toString()}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('Failed to search recipes');

      const searchResults = await response.json();
      setRecipes(searchResults.recipes || []);
    } catch (error) {
      console.error('Error during search:', error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleViewRecipe = (recipeId) => {
    router.push(`/foodview/users/${recipeId}`);
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
      {/* Filters */}
      <Box sx={{ padding: 3, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search Recipes"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          displayEmpty
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((category, index) => (
            <MenuItem key={index} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearchClick}
          startIcon={<SearchIcon />}
          disabled={searching}
        >
          {searching ? 'Searching...' : 'Search'}
        </Button>
      </Box>
      {/* Recipes */}
      <Box sx={{ padding: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 3 }}>
          Recommended Recipes
        </Typography>
        <Grid container spacing={3}>
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
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
                      Category: {recipe.category || 'Uncategorized'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary" onClick={() => handleViewRecipe(recipe.id)}>
                      View Recipe
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="body1">No recipes available.</Typography>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
