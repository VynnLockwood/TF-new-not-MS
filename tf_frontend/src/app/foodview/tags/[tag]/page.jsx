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
} from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';

const RecipesByTagPage = ({ params }) => {
  const { tag } = params; // Get the tag from URL params
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const decodedTag = decodeURIComponent(tag); // Decode the tag from URL

  useEffect(() => {
    const fetchRecipesByTag = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/recipes?tag=${encodeURIComponent(decodedTag)}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch recipes');
        }
        const data = await response.json();
        setRecipes(data.recipes || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipesByTag();
  }, [decodedTag]);

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
        <Typography variant="h6">No recipes found for the tag "{decodedTag}".</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: '2rem', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>
        Recipes Tagged with "{decodedTag}"
      </Typography>
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

export default RecipesByTagPage;
