'use client';

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useRouter } from "next/navigation";

const GeneratePage = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    const maxRetries = 3;
    let retryCount = 0;
    setLoading(true);
    setError("");
  
    try {
      let rawResponse = "";
      let recipeData = {};
      let videos = [];
  
      // Step 1: Generate recipe content
      while (retryCount < maxRetries) {
        try {
          console.log(`Attempt ${retryCount + 1}: Generating recipe...`);
          const generateRes = await fetch("https://f8ec-202-12-97-159.ngrok-free.app/api/gemini/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          });
  
          if (generateRes.status === 401) {
            setOpenDialog(true);
            setLoading(false);
            return;
          }
  
          if (!generateRes.ok) {
            const errorData = await generateRes.json();
            throw new Error(errorData.error || "Recipe generation failed");
          }
  
          const generateData = await generateRes.json();
          console.log("Raw Response from /generate API:", generateData.response);
          rawResponse = generateData.response;
  
          if (rawResponse) break; // Exit loop if raw response is valid
        } catch (err) {
          retryCount++;
          console.error(`Attempt ${retryCount} failed:`, err.message);
          if (retryCount === maxRetries) throw new Error("Failed to generate recipe after retries");
        }
      }
  
      // Step 2: Parse the generated response
      console.log("Raw Response before parsing:", rawResponse);
      console.log("Payload to /gemini/parse:", { response: rawResponse });

      console.log("Parsing the raw response using /parse API...");
      const parseRes = await fetch("https://f8ec-202-12-97-159.ngrok-free.app/api/gemini/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: rawResponse }), // Use rawResponse as input for /parse
      });
  
      if (!parseRes.ok) {
        const errorData = await parseRes.json();
        throw new Error(errorData.error || "Failed to parse recipe");
      }
  
      recipeData = await parseRes.json();
      console.log("Parsed Recipe Data:", recipeData);
  
      // Step 3: Store parsed data in sessionStorage
      const {
        menuName,
        ingredients,
        instructions,
        category,
        tags,
        characteristics,
        flavors,
      } = recipeData;
  
      if (
        menuName &&
        ingredients.length > 0 &&
        instructions.length > 0 &&
        category &&
        tags.length > 0 &&
        characteristics &&
        flavors
      ) {
        sessionStorage.setItem("generatedMenuName", menuName);
        sessionStorage.setItem("generatedIngredients", JSON.stringify(ingredients));
        sessionStorage.setItem("generatedInstructions", JSON.stringify(instructions));
        sessionStorage.setItem("generatedCategory", category);
        sessionStorage.setItem("generatedTags", JSON.stringify(tags));
        sessionStorage.setItem("generatedCharacteristics", characteristics);
        sessionStorage.setItem("generatedFlavors", flavors);
      } else {
        throw new Error("Parsed data is incomplete");
      }
  
      // Step 4: Search YouTube videos
      const searchKeyword = `วิธีทำ ${recipeData.menuName}`;
      console.log(`Searching YouTube videos: ${searchKeyword}`);
      const youtubeRes = await fetch("https://f8ec-202-12-97-159.ngrok-free.app/api/youtube/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ keyword: searchKeyword }),
      });
  
      if (!youtubeRes.ok) {
        const errorData = await youtubeRes.json();
        throw new Error(errorData.error || "YouTube search failed");
      }
  
      videos = (await youtubeRes.json()).videos || [];
      sessionStorage.setItem("youtubeVideos", JSON.stringify(videos));
  
      // Step 5: Redirect to the result page
      router.push(`/food_generated?menuName=${encodeURIComponent(recipeData.menuName)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  const handleCloseDialog = () => {
    setOpenDialog(false);
    router.push("/login");
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Authentication Required</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please log in to access this feature. If you're already a member, log in again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCloseDialog} color="primary" autoFocus>
            Log In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GeneratePage;
