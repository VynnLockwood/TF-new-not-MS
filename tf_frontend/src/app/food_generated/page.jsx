'use client';

import React, { useEffect, useState } from "react";
import { Suspense } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  List,
  ListItem,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Grid,
  CardContent,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import { useSearchParams } from "next/navigation";

const FoodGenerated = () => {
  const searchParams = useSearchParams();
  const menuName = searchParams.get("menuName") || "Unknown Menu";

  const [coverImage, setCoverImage] = useState(""); // Cover image URL
  const [isUploading, setIsUploading] = useState(false); // Upload state
  const [ingredients, setIngredients] = useState([]);

  const [characteristics, setCharacteristics] = useState([]);
  const [flavors, setFlavors] = useState([]);

  const [instructions, setInstructions] = useState([]);
  const [videos, setVideos] = useState([]);
  const [category, setCategory] = useState("Unknown Category");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [editingIndex, setEditingIndex] = useState({ type: null, index: null });
  const [editText, setEditText] = useState("");
  const [newIngredient, setNewIngredient] = useState("");
  const [newInstruction, setNewInstruction] = useState("");

  useEffect(() => {
    const storedCoverImage = sessionStorage.getItem("coverImage");
    const storedIngredients = sessionStorage.getItem("generatedIngredients");
    const storedInstructions = sessionStorage.getItem("generatedInstructions");
    const storedVideos = sessionStorage.getItem("youtubeVideos");
    const storedCategory = sessionStorage.getItem("generatedCategory");
    const storedTags = sessionStorage.getItem("generatedTags");
    const storedCharacteristics = sessionStorage.getItem("generatedCharacteristics");
    const storedFlavors = sessionStorage.getItem("generatedFlavors");
  
    // Safely parse JSON values and set state
    if (storedCoverImage) setCoverImage(storedCoverImage);
    if (storedIngredients) {
      try {
        setIngredients(parseAndSanitize(JSON.parse(storedIngredients)));
      } catch (e) {
        console.error("Error parsing generatedIngredients:", e);
      }
    }
    if (storedInstructions) {
      try {
        setInstructions(parseAndSanitize(JSON.parse(storedInstructions)));
      } catch (e) {
        console.error("Error parsing generatedInstructions:", e);
      }
    }
    if (storedVideos) {
      try {
        setVideos(JSON.parse(storedVideos));
      } catch (e) {
        console.error("Error parsing youtubeVideos:", e);
      }
    }
    if (storedCategory) setCategory(storedCategory);
    if (storedTags) {
      try {
        setTags(JSON.parse(storedTags));
      } catch (e) {
        console.error("Error parsing generatedTags:", e);
      }
    }
    if (storedCharacteristics) setCharacteristics(storedCharacteristics);
    if (storedFlavors) setFlavors(storedFlavors);
  }, []);
  

  // Sanitize and remove markdown symbols
  const parseAndSanitize = (data) => {
    return data.map((item) =>
      item.replace(/[*_~`>#]/g, "").trim() // Remove markdown characters
    );
  };

  // Handle cover image upload via API
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/api/imgur/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      const imageUrl = data.link;

      setCoverImage(imageUrl);
      sessionStorage.setItem("coverImage", imageUrl); // Save the uploaded image URL
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Add new ingredient
  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  // Add new instruction
  const handleAddInstruction = () => {
    if (newInstruction.trim()) {
      setInstructions([...instructions, newInstruction.trim()]);
      setNewInstruction("");
    }
  };

 // Add new tag with sanitization
const handleAddTag = () => {
  const sanitizeText = (text) => text.replace(/[^a-zA-Z0-9ก-๙\s]/g, "").trim(); // Remove all symbols except alphanumeric and Thai characters
  const sanitizedTag = sanitizeText(newTag);
  if (sanitizedTag && sanitizedTag !== "AI generate" && !tags.includes(sanitizedTag)) {
    setTags([...tags, sanitizedTag]);
    setNewTag("");
  }
};

// Delete item
const handleDelete = (type, index) => {
  if (type === "ingredient") {
    setIngredients(ingredients.filter((_, i) => i !== index));
  } else if (type === "instruction") {
    setInstructions(instructions.filter((_, i) => i !== index));
  } else if (type === "tag") {
    if (tags[index] !== "AI generate") {
      setTags(tags.filter((_, i) => i !== index));
    } else {
      alert("The 'AI generate' tag cannot be deleted.");
    }
  }
};

  // Edit item
  const handleEdit = (type, index) => {
    setEditingIndex({ type, index });
    if (type === "ingredient") {
      setEditText(ingredients[index]);
    } else if (type === "instruction") {
      setEditText(instructions[index]);
    }
  };

  // Save edited item
  const handleSaveEdit = () => {
    if (editingIndex.type === "ingredient") {
      const updatedIngredients = [...ingredients];
      updatedIngredients[editingIndex.index] = editText.trim();
      setIngredients(updatedIngredients);
    } else if (editingIndex.type === "instruction") {
      const updatedInstructions = [...instructions];
      updatedInstructions[editingIndex.index] = editText.trim();
      setInstructions(updatedInstructions);
    }
    setEditingIndex({ type: null, index: null });
    setEditText("");
  };

  return (
    <Box sx={{ padding: "2rem", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box sx={{ textAlign: "center", marginBottom: "2rem" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
          {menuName}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Generated by AI
        </Typography>
      </Box>

      {/* Category Section */}
      <Box sx={{ marginBottom: "2rem" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          หมวดหมู่ (Category): {category}
        </Typography>
      </Box>

      {/* Tags Section */}
      <Box sx={{ marginBottom: "2rem" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "1rem" }}>
          แท็ก (Tags):
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, marginBottom: "1rem" }}>
          {tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              onDelete={() => handleDelete("tag", index)}
              color="primary"
            />
          ))}
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Add Tag"
            variant="outlined"
            fullWidth
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />
          <Button variant="contained" onClick={handleAddTag} startIcon={<AddIcon />}>
            Add
          </Button>
        </Box>
      </Box>

      {/* Cover Image Section */}
      <Box sx={{ textAlign: "center", marginBottom: "2rem" }}>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: "800px",
            aspectRatio: "16/9",
            backgroundColor: "#d9d9d9",
            borderRadius: 4,
            overflow: "hidden",
            margin: "0 auto",
          }}
        >
          {coverImage && (
            <CardMedia
              component="img"
              image={coverImage}
              alt="Cover Image"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
        </Box>
        <Box sx={{ marginTop: 2 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={isUploading ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            {isUploading ? "Uploading..." : "Upload Image"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Recipe Details */}
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: "#d9f8d9", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              ส่วนผสม (Ingredients)
            </Typography>
            <List>
              {ingredients.map((ingredient, index) => (
                <ListItem key={index} sx={{ display: "flex", justifyContent: "space-between" }}>
                  {editingIndex.type === "ingredient" && editingIndex.index === index ? (
                    <TextField
                      fullWidth
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      sx={{ marginRight: 2 }}
                    />
                  ) : (
                    <Typography variant="body1">{ingredient}</Typography>
                  )}
                  <Box>
                    {editingIndex.type === "ingredient" && editingIndex.index === index ? (
                      <IconButton color="primary" onClick={handleSaveEdit}>
                        <SaveIcon />
                      </IconButton>
                    ) : (
                      <IconButton color="primary" onClick={() => handleEdit("ingredient", index)}>
                        <EditIcon />
                      </IconButton>
                    )}
                    <IconButton color="error" onClick={() => handleDelete("ingredient", index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
              <TextField
                label="Add Ingredient"
                variant="outlined"
                fullWidth
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
              />
              <Button variant="contained" onClick={handleAddIngredient} startIcon={<AddIcon />}>
                Add
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Instructions Section */}
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: "#d9f8d9", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              วิธีทำ (Instructions)
            </Typography>
            <List>
              {instructions.map((instruction, index) => (
                <ListItem key={index} sx={{ display: "flex", justifyContent: "space-between" }}>
                  {editingIndex.type === "instruction" && editingIndex.index === index ? (
                    <TextField
                      fullWidth
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      sx={{ marginRight: 2 }}
                    />
                  ) : (
                    <Typography variant="body1">{instruction}</Typography>
                  )}
                  <Box>
                    {editingIndex.type === "instruction" && editingIndex.index === index ? (
                      <IconButton color="primary" onClick={handleSaveEdit}>
                        <SaveIcon />
                      </IconButton>
                    ) : (
                      <IconButton color="primary" onClick={() => handleEdit("instruction", index)}>
                        <EditIcon />
                      </IconButton>
                    )}
                    <IconButton color="error" onClick={() => handleDelete("instruction", index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
              <TextField
                label="Add Instruction"
                variant="outlined"
                fullWidth
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
              />
              <Button variant="contained" onClick={handleAddInstruction} startIcon={<AddIcon />}>
                Add
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Submit Section */}
        <Button
  variant="contained"
  color="primary"
  onClick={async () => {
    console.log("Submit button clicked");

    try {
      console.log("Starting fetch request...");

      // Sanitize category and tags before submission
      const sanitizeText = (text) =>
        text.replace(/[^a-zA-Z0-9\sก-๙]/g, "").trim(); // Remove all symbols except alphanumeric and Thai characters
      const sanitizedCategory = sanitizeText(category);
      const sanitizedTags = tags.map(sanitizeText);

      console.log("Sanitized Category:", sanitizedCategory);
      console.log("Sanitized Tags:", sanitizedTags);

      // Prepare the recipe data for saving
      const recipeData = {
        name: menuName,
        ingredients,
        instructions,
        cover_image: coverImage,
        category: sanitizedCategory,
        tags: sanitizedTags,
        characteristics: characteristics, // Include characteristics
        flavors: flavors,         // Include flavors
        videos: videos.map((video) => ({
          title: video.title,
          url: `https://www.youtube.com/watch?v=${video.id}`,
        })),
      };

      console.log("Recipe Data:", recipeData);

      // Send data to the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/api/recipes/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        throw new Error("Failed to save recipe");
      }

      const data = await response.json();
      console.log("Response received:", data);

      // Clear session data after successful submission
      sessionStorage.clear();
      alert("Recipe saved successfully!");

      // Redirect the user to a confirmation or list page
      router.push(`/foodview/available`);
    } catch (error) {
      console.error("Error during fetch:", error);
      alert("Failed to save the recipe. Please try again.");
    }
  }}
>
  Submit Recipe
</Button>



        {/* Video Suggestions */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "1rem" }}>
            วิดีโอสอนทำอาหาร (How-to Videos)
          </Typography>
          <Grid container spacing={2}>
            {videos.length > 0 ? (
              videos.map((video, index) => (
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
              ))
            ) : (
              <Typography>No videos found for this recipe.</Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default function FoodGeneratedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FoodGenerated />
    </Suspense>
  );
}
