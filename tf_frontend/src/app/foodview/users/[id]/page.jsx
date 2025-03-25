'use client';

import React, { useEffect, useState, useRef } from 'react';
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
import axios from "axios";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";



const RecipeDetailPage = () => {


  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const [likedByUser, setLikedByUser] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(null);

  const [recipeId, setRecipeId] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Extract recipeId from the URL using window.location.pathname
    const id = window.location.pathname.split('/').pop();
    setRecipeId(id); // Set the extracted recipeId to the state

    console.log("Recipe ID from URL:", id); // Verify recipeId is extracted
}, []); // Run only on mount


  useEffect(() => {
    if (!recipeId) return; // Ensure recipeId is available before making the request

    axios.get(`${process.env.NEXT_PUBLIC_BACK_END_URL}/api/recipes/${recipeId}/rating`)
        .then(response => setRating(response.data.average_rating))
        .catch(error => console.error("Error fetching rating:", error));
}, [recipeId]);

const handleRating = (score) => {
  if (!recipeId) return;

  // Optimistically update the UI before the API call
  const newRating = (rating * 4 + score) / 5; // Calculate the new average rating

  setUserRating(score);  // Update the user rating locally
  setRating(newRating);  // Update the overall rating locally

  axios.post(`${process.env.NEXT_PUBLIC_BACK_END_URL}/api/recipes/${recipeId}/rate`, { score }, { withCredentials: true })
      .then(response => {
          console.log("API response:", response.data);
          // Optionally, you could refresh the rating from the backend in case of any discrepancies
      })
      .catch(error => {
          console.error("Error submitting rating:", error);
          // In case of error, you can revert the UI update or display a message
          setUserRating(prev => prev); // Revert to previous rating
          setRating(prev => prev); // Revert to previous rating
      });
};


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

  const splitTags = (tags) => {
    if (!tags || !Array.isArray(tags)) return []; // Ensure it's an array
    if (tags.length === 0) return []; // Handle empty arrays
    return tags[0].split(',').map((tag) => tag.trim()); // Split the first string in the array
};


  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        const recipeId = window.location.pathname.split('/').pop();

        const recipeResponse = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/api/recipes/${recipeId}`, {
          method: 'GET',
          credentials: 'include',
        });

        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include',
        });


        const userData = ''

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log("name to set is: " + userData.user.name); // Correct path
          setUserName(userData.user.name);
        }
        



        if (!recipeResponse.ok) throw new Error('Failed to fetch recipe details');

        const recipeData = await recipeResponse.json();
        setRecipe(recipeData);
        setComments(recipeData.comments || []);
        setRating(recipeData.average_rating || 0);
        setLikedByUser(recipeData.liked_by_user || false);

        console.log('username: '+ userName)
        console.log('Owner recipe: '+recipeData.created_by_name)
        if (userName == recipeData.created_by_name){
          setIsOwner(true)
          console.log('viewd by owner')
        }

        const videosResponse = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/api/recipes/${recipeId}/related_videos`, {
          method: 'GET',
          credentials: 'include',
        });

        if (videosResponse.ok) {
          const videoData = await videosResponse.json();
          setRelatedVideos(videoData.related_videos || []);
        }

        const suggestedResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_END_URL}/api/recipes/${recipeId}/suggested_recipes`,
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/api/${recipeId}/like`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/api/${recipeId}/comment`, {
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

  const handleEditRecipe = () => {
    sessionStorage.setItem("editRecipe", JSON.stringify({
      recipe
    }));
  
    window.location.href = "/foodedit"; // Navigate to the edit page
  };
  
  

  const handleDuplicateRecipe = async (recipeId) => {
    try {
      // Fetch original recipe details
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_END_URL}/api/recipes/${recipeId}/duplicate`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to fetch recipe for duplication');
      }
  
      const recipeData = await response.json();
  
      // Save the recipe data in local storage or session storage
      localStorage.setItem('duplicatedRecipe', JSON.stringify(recipeData));
  
      // Redirect to the recipe editing page
      router.push('/recipe/edit');
    } catch (error) {
      console.error('Error duplicating recipe:', error.message);
    }
  };
  

  
  const handleToggleFavorite = async () => {
    try {
      // Fetch credentials from session storage
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      if (!user.id) {
        throw new Error('User credentials not found in session storage');
      }
  
      // Extract recipeId from URL and convert to integer
      const recipeIdStr = window.location.pathname.split('/').pop();
      const recipeId = parseInt(recipeIdStr, 10); // Convert string to integer
      console.log('recipeId: ', recipeId); // Should log: "recipeId: 4" (number, not string)
  
      // Validate recipeId is a valid integer
      if (isNaN(recipeId)) {
        throw new Error('Invalid recipe ID from URL');
      }
  
      const payload = {
        recipe_id: recipeId, // Now an integer
        user_id: user.id,    // Already an integer from session storage
      };
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/api/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log(data.message); // e.g., "Recipe 4 added to favorites"
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const sendMessage = async () => {
    if (input) {
      const newMessage = { text: input, sender: "user" };
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
      
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: `คุณคือ AI ของเว็บสูตรอาหาร ที่จะช่วยตอบคำถามผู้ใช้เกี่ยวกับอาหารหรือข้อมูลเกี่ยวกับอาหารเพิ่มเติม นี่คือสูตรอาหารที่ผู้ใช้กำลังดูอยู่: ${JSON.stringify(recipe)}` },
              { role: "user", content: input }
            ]
          })
        });
        
        const data = await response.json();
        const aiMessage = { text: data.choices[0].message.content, sender: "ai" };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("Error fetching AI response:", error);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

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

  {userName === recipe.created_by_name && (
  <Button 
    variant="contained" 
    color="primary" 
    onClick={handleEditRecipe}
 
  >
    Edit Recipe
  </Button>
)}

<Button onClick={handleToggleFavorite} >
      {'บันทึกสูตรอาหาร'}
    </Button>


  <Typography variant="body1" color="textPrimary" sx={{ marginTop: '0.5rem' }}>
    <strong>Category:</strong> {recipe.category || 'Uncategorized'}
  </Typography>

  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
  {splitTags(recipe.tags).map((tag, index) => (
    <Typography
      key={index}
      onClick={() => router.push(`/foodview/tags/${encodeURIComponent(tag)}`)}
      sx={{
        backgroundColor: '#e0f7fa',
        color: '#00796b',
        padding: '0.5rem 1rem',
        borderRadius: '16px',
        fontSize: '0.875rem',
        cursor: 'pointer',
        '&:hover': { backgroundColor: '#b2ebf2' },
      }}
    >
      {tag}
    </Typography>
  ))}
</Box>



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
            <Grid container direction="column" alignItems="center" spacing={2}>
      <Grid item>
        <StarRateIcon sx={{ color: '#FFD700', fontSize: { xs: 40, sm: 50, md: 60 } }} />
      </Grid>
      <Grid item>
        <Typography variant="subtitle1" textAlign="center" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Rating: {rating.toFixed(1)} / 5
        </Typography>
      </Grid>
      <Grid item container justifyContent="center" spacing={1}>
        {[1, 2, 3, 4, 5].map(score => (
          <Grid item key={score}>
            <Button
              onClick={() => handleRating(score)}
              variant={userRating === score ? 'contained' : 'outlined'}
              sx={{
                padding: { xs: '8px', sm: '10px' },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                minWidth: { xs: '30px', sm: '40px' },
                height: { xs: '40px', sm: '45px' },
              }}
            >
              {score} ★
            </Button>
          </Grid>
        ))}
      </Grid>
    </Grid>
              <Button
                startIcon={<ThumbUpIcon />}
                variant="outlined"
                size="small"
                onClick={handleLikeToggle}
                className='absolute'
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


      {/* <Button
  size="small"
  color="secondary"
  variant="outlined"
  onClick={() => handleDuplicateRecipe(recipe.id)}
>
  Duplicate Recipe
</Button> */}



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

    {/* Floating Chat Button */}
    <button onClick={() => setIsOpen(true)} style={{ position: "fixed", bottom: 20, right: 20, padding: "10px 20px", backgroundColor: "#ff5722", color: "white", borderRadius: "50%" }}>💬</button>
      
      {/* Chat Modal */}
      {isOpen && (
        <div style={{ position: "fixed", bottom: 80, right: 20, width: "90%", maxWidth: 400, height: "70vh", maxHeight: 500, backgroundColor: "white", boxShadow: "0px 4px 6px rgba(0,0,0,0.1)", padding: 10, borderRadius: 10, display: "flex", flexDirection: "column" }}>
          <button onClick={() => setIsOpen(false)} style={{ alignSelf: "flex-end", background: "none", border: "none", fontSize: 20 }}>✖</button>
          <div style={{ overflowY: "auto", flexGrow: 1, padding: "10px" }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ 
                background: msg.sender === "user" ? "#d1e7ff" : "#f1f1f1", 
                padding: "10px", 
                borderRadius: "10px", 
                marginBottom: "10px",
                textAlign: "left"
              }}>
                <strong>{msg.sender === "user" ? "You" : "AI"}:</strong>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: "flex", gap: "5px" }}>
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={handleKeyDown} 
              style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} 
              placeholder="Ask about this recipe..." 
            />
            <button onClick={sendMessage} style={{ padding: "10px", backgroundColor: "#ff5722", color: "white", borderRadius: "5px", border: "none" }}>Send</button>
          </div>
        </div>
      )}


    </Box>
  );
};

export default RecipeDetailPage;
