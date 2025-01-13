'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useUser } from '@/context/UserContext'; // Import the UserContext


const UserProfilePage = () => {
    const { id: userId } = useParams(); // Use useParams for dynamic route handling
    const { fetchUser } = useUser(); // Import fetchUser from UserContext
    const [user, setUser] = useState(null); // User details
    const [recipes, setRecipes] = useState([]); // Recipes created by the user
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(''); // Error state
    const [editMode, setEditMode] = useState(false); // State for edit mode
    const [updatedName, setUpdatedName] = useState(''); // State for updated username
    const [updatedProfilePic, setUpdatedProfilePic] = useState(''); // State for updated profile picture
    const [uploading, setUploading] = useState(false); // State for uploading profile picture
    const router = useRouter();

  // Fetch user details and recipes
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch user details
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/api/users/${userId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          throw new Error(errorData.error || 'Failed to fetch user details');
        }

        const userData = await userResponse.json();
        setUser(userData);
        setUpdatedName(userData.name); // Pre-fill with existing data
        setUpdatedProfilePic(userData.profile_picture || '');

        // Fetch user's recipes
        const recipesResponse = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/api/users/${userId}/recipes`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!recipesResponse.ok) {
          const errorData = await recipesResponse.json();
          throw new Error(errorData.error || 'Failed to fetch user recipes');
        }

        const recipesData = await recipesResponse.json();
        setRecipes(recipesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const handleProfilePicUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/api/imgur/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      setUpdatedProfilePic(data.link); // Set the uploaded image URL
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEditProfile = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: updatedName,
          picture: updatedProfilePic,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
  
      const updatedUser = await response.json();
  
      // Update the cache in sessionStorage
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
  
      // Call fetchUser to update the Navbar and context
      await fetchUser();
  
      setEditMode(false); // Exit edit mode
    } catch (err) {
      console.error("Error while updating profile:", err);
      setError(err.message);
    }
  };


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

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', marginTop: '2rem' }}>
        <Typography variant="h6">User not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: '2rem', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      {/* User Profile */}
      <Box sx={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Avatar
          src={user.profile_picture || '/default-avatar.png'}
          alt={user.name}
          sx={{ width: 100, height: 100, margin: '0 auto', cursor: 'pointer' }}
          onClick={() => setEditMode(true)} // Open edit dialog
        />
        <Typography variant="h5" sx={{ fontWeight: 'bold', marginTop: '1rem' }}>
          {user.name}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {user.email}
        </Typography>
        <Button
          variant="outlined"
          sx={{ marginTop: '1rem' }}
          onClick={() => setEditMode(true)}
        >
          Edit Profile
        </Button>
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog open={editMode} onClose={() => setEditMode(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Username"
            value={updatedName}
            onChange={(e) => setUpdatedName(e.target.value)}
            sx={{ marginBottom: '1rem' }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              disabled={uploading}
            >
              Upload Profile Picture
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleProfilePicUpload(e.target.files[0])}
              />
            </Button>
            {uploading && <CircularProgress size={24} />}
          </Box>
          {updatedProfilePic && (
            <Box sx={{ textAlign: 'center', marginTop: '1rem' }}>
              <Avatar src={updatedProfilePic} alt="Preview" sx={{ width: 100, height: 100, margin: '0 auto' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMode(false)}>Cancel</Button>
          <Button onClick={handleEditProfile} variant="contained" color="primary" disabled={uploading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Recipes */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '1rem' }}>
        Recipes by {user.name}
      </Typography>
      <Grid container spacing={3}>
        {recipes.map((recipe) => (
          <Grid item xs={12} sm={6} md={4} key={recipe.id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={recipe.cover_image || 'https://via.placeholder.com/300x200'}
                alt={recipe.name}
              />
              <CardContent>
                <Typography variant="h6">{recipe.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {recipe.likes || 0} Likes <br />
                  {recipe.comments?.length || 0} Comments
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => router.push(`/foodview/users/${recipe.id}`)}
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

export default UserProfilePage;
