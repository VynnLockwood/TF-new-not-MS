"use client";

import React, { useState } from "react";
import { TextField, Button, CircularProgress, Typography, Box } from "@mui/material";
import { useRouter } from "next/navigation";

const GeneratePage = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const parseRecipeResponse = (response: string) => {
    const lines = response.split("\n").map(line => line.trim());
    let menuName = "";
    const ingredients: string[] = [];
    const instructions: string[] = [];
    let section = "";
  
    lines.forEach(line => {
      if (line.startsWith("##")) {
        menuName = line.replace("##", "").trim();
      } else if (line.includes("ส่วนผสม:") || line.includes("Ingredients:")) {
        section = "ingredients";
      } else if (line.includes("วิธีทำ:") || line.includes("Instructions:")) {
        section = "instructions";
      } else if (section === "ingredients") {
        if (line) ingredients.push(line);
      } else if (section === "instructions") {
        if (line) instructions.push(line);
      }
    });
  
    return { menuName, ingredients, instructions };
  };
  
  const handleGenerate = async () => {
    setLoading(true);
    setError("");
  
    try {
      // First request to generate menu name and recipe
      const generateRes = await fetch("http://localhost:5000/gemini/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        credentials: "include",
      });
  
      if (!generateRes.ok) {
        const errorData = await generateRes.json();
        throw new Error(errorData.error || "Something went wrong in recipe generation");
      }
  
      const generateData = await generateRes.json();
  
      // Save the whole response for debugging
      sessionStorage.setItem("fullGeneratedResponse", generateData.response);
  
      // Parse the response
      const { menuName, ingredients, instructions } = parseRecipeResponse(generateData.response);
  
      if (!menuName || menuName.trim() === "") {
        throw new Error("Failed to generate a valid recipe. Please try again.");
      }
  
      // Save the parsed data in sessionStorage
      sessionStorage.setItem("generatedMenuName", menuName);
      sessionStorage.setItem("generatedIngredients", JSON.stringify(ingredients));
      sessionStorage.setItem("generatedInstructions", JSON.stringify(instructions));
  
      // Create the YouTube search keyword
      const keyword = `วิธีทำ ${menuName}`;
      sessionStorage.setItem("youtubeSearchKeyword", keyword);
  
      // Second request to fetch YouTube videos
      const youtubeRes = await fetch("http://localhost:5000/youtube/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          keyword,
        }),
      });
  
      if (!youtubeRes.ok) {
        const errorData = await youtubeRes.json();
        throw new Error(errorData.error || "Something went wrong in YouTube video search");
      }
  
      const youtubeData = await youtubeRes.json();
      const videos = youtubeData.videos || [];
  
      // Save videos to sessionStorage
      sessionStorage.setItem("youtubeVideos", JSON.stringify(videos));
  
      // Redirect to /food_generated if all data is valid
      if (menuName && ingredients.length > 0 && instructions.length > 0 && videos.length > 0) {
        router.push(`/food_generated?menuName=${encodeURIComponent(menuName)}`);
      } else {
        throw new Error(
          `Recipe generated: ${menuName}. No videos found for keyword: "${keyword}".`
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  
    

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 5, p: 2, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Generate Recipe & Find Videos
      </Typography>
      <TextField
        fullWidth
        label="Enter your prompt"
        variant="outlined"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleGenerate}
        disabled={loading || !prompt}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : "Generate & Search"}
      </Button>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default GeneratePage;
