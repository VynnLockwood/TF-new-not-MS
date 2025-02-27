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
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { useRouter } from 'next/navigation';

const AvailableRecipesPage = () => {
  const [recipes, setRecipes] = useState([]); // State for all recipes
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state
  const [selectedTag, setSelectedTag] = useState(''); // Selected tag
  const [selectedCategory, setSelectedCategory] = useState(''); // Selected category
  const [tags, setTags] = useState([]); // Available tags
  const [categories, setCategories] = useState([]); // Available categories

  const router = useRouter();

  // Fetch all available recipes from the database
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const query = new URLSearchParams();
        if (selectedTag) query.append('tag', selectedTag);
        if (selectedCategory) query.append('category', selectedCategory);

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/api/recipes?${query.toString()}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch recipes');
        }

        const data = await response.json();
        setRecipes(data.recipes || []); // Set the recipes state
        setTags(data.tags || []); // Set available tags if provided in API
        setCategories(data.categories || []); // Set available categories if provided in API
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [selectedTag, selectedCategory]); // Refetch when tag or category changes

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', marginTop: '2rem' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (recipes.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', marginTop: '2rem' }}>
        <Typography variant="h6">No recipes available at the moment.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: '2rem', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>
        Available Recipes
      </Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: '2rem' }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category, index) => (
              <MenuItem key={index} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Tag</InputLabel>
          <Select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} label="Tag">
            <MenuItem value="">All Tags</MenuItem>
            {tags.map((tag, index) => (
              <MenuItem key={index} value={tag}>
                {tag}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Recipes */}
      <Grid container spacing={2}>
        {recipes.map((recipe) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
            <Card>
              <CardMedia
                component="img"
                image={recipe.cover_image || 'https://via.placeholder.com/300x200'}
                alt={recipe.name || 'Recipe Image'}
                sx={{ height: 140 }}
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {recipe.name || 'Unnamed Recipe'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Created by {recipe.creator_name || 'Anonymous'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Category: {recipe.category || 'Uncategorized'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginTop: '0.5rem' }}>
                  {recipe.tags &&
                    (Array.isArray(recipe.tags) ? recipe.tags : recipe.tags.split(',')).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag.trim()} // Ensure no extra spaces around tags
                        onClick={() => {
                          router.push(`/foodview/tags/${encodeURIComponent(tag.trim())}`);
                        }}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#e0f7fa' },
                        }}
                      />
                    ))}
                </Box>

              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => {
                    router.push(`/foodview/users/${recipe.id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to the top
                  }}
                  color="primary"
                  variant="outlined"
                >
                  View Recipe
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AvailableRecipesPage;
