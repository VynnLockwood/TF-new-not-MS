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

const RecipeDetailPage = ({ recipeId }) => {
  const [recipe, setRecipe] = useState(null); // Recipe data
  const [comments, setComments] = useState([]);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [likes, setLikes] = useState(0);
  const [rating, setRating] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog state
  const [newComment, setNewComment] = useState("");

  const router = useRouter(); // Initialize useRouter

  const fetchRecipeDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/recipes/recipes/${recipeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipe details');
      }
      const data = await response.json();
      setRecipe(data.recipe);
      setComments(data.comments || []);
      setRelatedVideos(data.related_videos || []);
      setLikes(data.likes || 0);
      setRating(data.rating || 0);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/recipes/recipes/${recipeId}/like`, {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
      });
      if (!response.ok) {
        throw new Error('Failed to like recipe');
      }
      const data = await response.json();
      setLikes(data.likes);
    } catch (error) {
      console.error('Error liking recipe:', error);
    }
  };

  const handleAddComment = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/recipes/recipes/${recipeId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ comment: newComment }),
      });
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      const data = await response.json();
      setComments((prevComments) => [...prevComments, { content: newComment }]);
      setNewComment(""); // Reset the comment field
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  useEffect(() => {
    fetchRecipeDetails();
  }, [recipeId]);

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
          {recipe.name || 'Unnamed Recipe'}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Thaifoods, {new Date(recipe.created_at).toLocaleDateString()}
        </Typography>
      </Box>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Recipe Image */}
        <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            image={recipe.cover_image || 'https://via.placeholder.com/800x400'}
            alt={recipe.name || 'Recipe Image'}
            sx={{ borderRadius: '8px', boxShadow: 1 }}
          />
        </Grid>

        {/* Recipe Details */}
        <Grid item xs={12} md={6}>
          {/* Ratings and Likes */}
          <Box sx={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <StarRateIcon sx={{ color: '#FFD700' }} />
            <Typography variant="subtitle1">{rating.toFixed(1)} / 5</Typography>
            <Button startIcon={<ThumbUpIcon />} variant="outlined" size="small" onClick={handleLike}>
              Like {likes}
            </Button>
            <Button startIcon={<CommentIcon />} variant="outlined" size="small" onClick={() => setIsDialogOpen(true)}>
              Comment {comments.length}
            </Button>
          </Box>

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <Box sx={{ backgroundColor: '#d9f8d9', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Ingredients
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
                Instructions
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

      {/* Related Videos */}
      <Box sx={{ marginTop: '2rem' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '1rem' }}>
          Related Videos
        </Typography>
        <Grid container spacing={2}>
          {relatedVideos.map((video, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardMedia
                  component="iframe"
                  height="200"
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <CardContent>
                  <Typography variant="body2">{video.title}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Comment Section */}
      <Box sx={{ marginTop: '2rem', backgroundColor: '#e9e9e9', padding: '1.5rem', borderRadius: '8px' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '1rem' }}>
          Comments
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Add your comment..."
          variant="outlined"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{ marginBottom: '1rem' }}
        />
        <Button variant="contained" color="primary" onClick={handleAddComment}>
          Submit Comment
        </Button>
        <Box sx={{ marginTop: '1rem' }}>
          {comments.map((comment, index) => (
            <Typography key={index} variant="body1" sx={{ marginBottom: '0.5rem' }}>
              {comment.content}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default RecipeDetailPage;
