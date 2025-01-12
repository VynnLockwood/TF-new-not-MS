'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CardMedia,
  Grid,
  CircularProgress,
  Button,
  TextField,
  Divider,
  Avatar,
  Card,
  IconButton,
} from '@mui/material';
import StarRateIcon from '@mui/icons-material/StarRate';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import KitchenIcon from '@mui/icons-material/Kitchen';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useRouter } from 'next/navigation';

const RecipeDetailPage = () => {
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [likedByUser, setLikedByUser] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const parseOrSplit = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return data.split('\n');
      }
    }
    return [];
  };

  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        const recipeId = window.location.pathname.split('/').pop();

        const recipeResponse = await fetch(`http://localhost:5000/api/recipes/${recipeId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!recipeResponse.ok) throw new Error('Failed to fetch recipe details');

        const recipeData = await recipeResponse.json();
        setRecipe(recipeData);
        setComments(recipeData.comments || []);
        setRating(recipeData.average_rating || 0);
        setLikedByUser(recipeData.liked_by_user || false);

        const videosResponse = await fetch(`http://localhost:5000/api/recipes/${recipeId}/related_videos`, {
          method: 'GET',
          credentials: 'include',
        });

        if (videosResponse.ok) {
          const videoData = await videosResponse.json();
          setRelatedVideos(videoData.related_videos || []);
        }

        const suggestedResponse = await fetch(
          `http://localhost:5000/api/recipes/${recipeId}/suggested_recipes`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (suggestedResponse.ok) {
          const suggestedData = await suggestedResponse.json();
          setSuggestedRecipes(suggestedData.suggested_recipes || []);
        }
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeData();
  }, []);

  const handleLikeToggle = async () => {
    try {
      const recipeId = recipe.id;
      const response = await fetch(`http://localhost:5000/api/${recipeId}/like`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to toggle like status');

      const data = await response.json();
      setRecipe((prev) => ({ ...prev, likes: data.likes }));
      setLikedByUser(!likedByUser);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleAddComment = async () => {
    try {
      const recipeId = recipe.id;
      const response = await fetch(`http://localhost:5000/api/${recipeId}/comment`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: newComment }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      const data = await response.json();
      setComments((prev) => [
        ...prev,
        { content: newComment, user: data.user, created_at: new Date().toISOString() },
      ]);
      setNewComment('');
    } catch (error) {
      console.error(error.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!recipe) {
    return (
      <Typography variant="h6" sx={{ textAlign: 'center', marginTop: '2rem' }}>
        No recipe found.
      </Typography>
    );
  }

  const ingredients = parseOrSplit(recipe.ingredients);
  const instructions = parseOrSplit(recipe.instructions);

  return (
    <Box sx={{ padding: '2rem', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#444' }}
        >
          {recipe.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Created by: {recipe.created_by_name || 'Anonymous'} |{' '}
          {new Date(recipe.created_at).toLocaleDateString()}
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ marginTop: '1rem' }}>
        <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            image={recipe.cover_image || 'https://via.placeholder.com/800x400'}
            alt={recipe.name}
            sx={{ borderRadius: '8px', boxShadow: 1 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              backgroundColor: '#f0fff0',
              padding: '1rem',
              borderRadius: '8px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <StarRateIcon sx={{ color: '#FFD700' }} />
              <Typography variant="subtitle1">{rating} / 5</Typography>
              <Button
                startIcon={<ThumbUpIcon />}
                variant="outlined"
                size="small"
                onClick={handleLikeToggle}
              >
                {likedByUser ? 'Unlike' : 'Like'} {recipe.likes || 0}
              </Button>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Ingredients
              </Typography>
              <ul>
                {ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Instructions
              </Typography>
              <ol>
                {instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ marginTop: '2rem' }}>
        <Typography variant="h6">Comments</Typography>
        {comments.map((comment, index) => (
          <Box key={index} sx={{ marginBottom: '1rem' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <Avatar
                src={comment.user?.profile_picture || '/placeholder-avatar.png'}
                alt={comment.user?.name || 'User'}
                sx={{ marginRight: '0.5rem' }}
              />
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {comment.user?.name || 'Anonymous'}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ marginBottom: '0.5rem' }}>
              {comment.content}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {new Date(comment.created_at).toLocaleString()}
            </Typography>
            {index < comments.length - 1 && <Divider sx={{ marginTop: '1rem' }} />}
          </Box>
        ))}

        <Box sx={{ marginTop: '2rem' }}>
          <Typography variant="h6">Add Comment</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment..."
            sx={{ marginBottom: '1rem' }}
          />
          <Button variant="contained" color="primary" onClick={handleAddComment}>
            Submit Comment
          </Button>
        </Box>
      </Box>

      <Box sx={{ marginTop: '2rem' }}>
        <Typography variant="h6">Related Videos</Typography>
        <Grid container spacing={2}>
          {relatedVideos.map((video, index) => {
            const videoId = video.url.split('v=')[1]?.split('&')[0];
            const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';

            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                {embedUrl ? (
                  <iframe
                    width="100%"
                    height="200"
                    src={embedUrl}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <Typography color="error">Invalid Video URL</Typography>
                )}
                <Typography variant="body2">{video.title}</Typography>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Box sx={{ marginTop: '2rem' }}>
        <Typography variant="h6">Suggested Recipes</Typography>
        <Grid container spacing={2}>
          {suggestedRecipes.map((suggestedRecipe, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <CardMedia
                  component="img"
                  image={suggestedRecipe.cover_image || 'https://via.placeholder.com/400'}
                  alt={suggestedRecipe.name}
                  sx={{ height: '200px' }}
                />
                <Box sx={{ padding: '1rem' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {suggestedRecipe.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Created by: {suggestedRecipe.creator_name || 'Anonymous'}
                  </Typography>
                </Box>
                <Button
  variant="contained"
  color="primary"
  onClick={() => {
    router.push(`/foodview/users/${suggestedRecipe.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the top of the page
  }}
  sx={{ margin: '1rem' }}
>
  View Recipe
</Button>

              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default RecipeDetailPage;
