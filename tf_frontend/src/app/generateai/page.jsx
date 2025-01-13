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
  const [openDialog, setOpenDialog] = useState(false); // Dialog state
  const router = useRouter();

  const parseRecipeResponse = (response) => {
    const lines = response.split("\n").map((line) => line.trim());
    let menuName = "";
    const ingredients = [];
    const instructions = [];
    let category = "";
    const tags = ["AI generate"]; // Default tag

    let section = "";

    lines.forEach((line) => {
      if (line.startsWith("##")) {
        menuName = line.replace("##", "").trim();
      } else if (line.includes("ส่วนผสม:") || line.includes("Ingredients:")) {
        section = "ingredients";
      } else if (line.includes("วิธีทำ:") || line.includes("Instructions:")) {
        section = "instructions";
      } else if (line.includes("Category:") || line.includes("หมวดหมู่:")) {
        category = line.replace("Category:", "").replace("หมวดหมู่:", "").trim();
      } else if (line.includes("Tags:") || line.includes("แท็ก:")) {
        tags.push(
          ...line
            .replace("Tags:", "")
            .replace("แท็ก:", "")
            .split(",")
            .map((tag) => tag.trim())
        );
      } else if (section === "ingredients") {
        if (line) ingredients.push(line);
      } else if (section === "instructions") {
        if (line) instructions.push(line);
      }
    });

    return { menuName, ingredients, instructions, category, tags };
  };

  const handleGenerate = async () => {
    const maxRetries = 3; // Maximum retries for each step
    let retryCount = 0;
    setLoading(true);
    setError("");

    try {
      // First request to generate menu name and recipe
      let menuName = "";
      let ingredients = [];
      let instructions = [];
      let category = "";
      let tags = [];

      while (retryCount < maxRetries) {
        try {
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
          const parsedData = parseRecipeResponse(generateData.response);

          menuName = parsedData.menuName;
          ingredients = parsedData.ingredients;
          instructions = parsedData.instructions;
          category = parsedData.category;
          tags = parsedData.tags;

          if (
            menuName &&
            ingredients.length > 0 &&
            instructions.length > 0 &&
            category &&
            tags.length > 0
          ) {
            sessionStorage.setItem("generatedMenuName", menuName);
            sessionStorage.setItem("generatedIngredients", JSON.stringify(ingredients));
            sessionStorage.setItem("generatedInstructions", JSON.stringify(instructions));
            sessionStorage.setItem("generatedCategory", category);
            sessionStorage.setItem("generatedTags", JSON.stringify(tags));
            break; // Exit retry loop if data is valid
          }
        } catch (err) {
          retryCount++;
          console.warn(`Retrying recipe generation... Attempt ${retryCount}`);
          if (retryCount === maxRetries)
            throw new Error("Failed to generate recipe after multiple attempts");
        }
      }

      // Reset retry count for YouTube search
      retryCount = 0;
      let videos = [];
      const simplifiedMenuName = menuName.replace(/\(.*?\)/g, "").trim();
      const keyword = `วิธีทำ${simplifiedMenuName}`;

      while (retryCount < maxRetries) {
        try {
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

          if (youtubeRes.status === 401) {
            setOpenDialog(true);
            setLoading(false);
            return;
          }

          if (!youtubeRes.ok) {
            const errorData = await youtubeRes.json();
            throw new Error(errorData.error || "YouTube video search failed");
          }

          const youtubeData = await youtubeRes.json();
          videos = youtubeData.videos || [];

          if (videos.length > 0) {
            sessionStorage.setItem("youtubeVideos", JSON.stringify(videos));
            break; // Exit retry loop if data is valid
          }
        } catch (err) {
          retryCount++;
          console.warn(`Retrying YouTube search... Attempt ${retryCount}`);
          if (retryCount === maxRetries)
            throw new Error("Failed to fetch YouTube videos after multiple attempts");
        }
      }

      // Redirect to /food_generated if all data is valid
      if (
        menuName &&
        ingredients.length > 0 &&
        instructions.length > 0 &&
        category &&
        tags.length > 0 &&
        videos.length > 0
      ) {
        router.push(`/food_generated?menuName=${encodeURIComponent(menuName)}`);
      } else {
        throw new Error("Failed to generate complete recipe and video data");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    router.push("/login"); // Redirect to login page
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

      {/* Dialog for session timeout */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>ฟังก์ชันนี้สงวนไว้สำหรับสมาชิก</DialogTitle>
        <DialogContent>
          <DialogContentText>
            กรุณาลงชื่อเข้าใช้หรือลงทะเบียนเพื่อใช้งานฟังก์ชันนี้ หากคุณเป็นสมาชิกอยู่แล้ว โปรดเข้าสู่ระบบอีกครั้ง
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            ยกเลิก
          </Button>
          <Button onClick={handleCloseDialog} color="primary" autoFocus>
            ลงชื่อเข้าใช้
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GeneratePage;
