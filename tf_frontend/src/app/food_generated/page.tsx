"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Typography, List, ListItem, Divider } from "@mui/material";

const FoodGenerated = () => {
  const searchParams = useSearchParams();
  const menuName = searchParams.get("menuName") || "Unknown Menu";

  const [fullGeneratedResponse, setFullGeneratedResponse] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // Retrieve parsed data from sessionStorage
    const storedFullResponse = sessionStorage.getItem("fullGeneratedResponse");
    const storedIngredients = sessionStorage.getItem("generatedIngredients");
    const storedInstructions = sessionStorage.getItem("generatedInstructions");
    const storedVideos = sessionStorage.getItem("youtubeVideos");

    if (storedFullResponse) setFullGeneratedResponse(storedFullResponse);
    if (storedIngredients) setIngredients(JSON.parse(storedIngredients));
    if (storedInstructions) setInstructions(JSON.parse(storedInstructions));
    if (storedVideos) setVideos(JSON.parse(storedVideos));
  }, []);

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 5, p: 2 }}>
      {/* Recipe Title */}
      <Typography variant="h4" gutterBottom>
        Recipe: {menuName}
      </Typography>

      {/* Full Generated Response */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Full Generated Response:
      </Typography>
      <Typography
        variant="body1"
        sx={{ whiteSpace: "pre-wrap", wordWrap: "break-word", mb: 4 }}
      >
        {fullGeneratedResponse || "No full response available."}
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Ingredients Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Ingredients:
      </Typography>
      {ingredients.length > 0 ? (
        <List>
          {ingredients.map((ingredient, index) => (
            <ListItem key={index}>{ingredient}</ListItem>
          ))}
        </List>
      ) : (
        <Typography>No ingredients found.</Typography>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Instructions Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Instructions:
      </Typography>
      {instructions.length > 0 ? (
        <List>
          {instructions.map((instruction, index) => (
            <ListItem key={index}>{`${index + 1}. ${instruction}`}</ListItem>
          ))}
        </List>
      ) : (
        <Typography>No instructions found.</Typography>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Videos Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Watch How to Make It:
      </Typography>
      {videos.length > 0 ? (
        videos.map((video, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${video.id}`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {video.title}
            </Typography>
          </Box>
        ))
      ) : (
        <Typography>No videos found for this recipe.</Typography>
      )}
    </Box>
  );
};

export default FoodGenerated;
