'use client';

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CardMedia,
  List,
  ListItem,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import UploadIcon from "@mui/icons-material/Upload";
import { useRouter } from "next/navigation";

// Define the Recipe type
interface Recipe {
  name: string;
  cover_image?: string;
  ingredients: string[];
  instructions: string[];
}

interface EditingIndex {
  type?: "ingredients" | "instructions";
  index?: number;
}

const EditRecipePage: React.FC = () => {
  const [recipe, setRecipe] = useState<Recipe | null>(null); // Full recipe object
  const [editingIndex, setEditingIndex] = useState<EditingIndex>({});
  const [editText, setEditText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");

  const router = useRouter();

  // Load duplicated recipe data from localStorage
  useEffect(() => {
    const duplicatedRecipe = localStorage.getItem("duplicatedRecipe");
    if (!duplicatedRecipe) {
      router.push("/dashboard"); // Redirect if no data is found
      return;
    }
    setRecipe(JSON.parse(duplicatedRecipe) as Recipe);
  }, [router]);

  if (!recipe) {
    return (
      <Box sx={{ textAlign: "center", padding: 5 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          กำลังโหลดข้อมูลสูตรอาหาร...
        </Typography>
      </Box>
    );
  }

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:5000/api/imgur/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setRecipe((prev) => (prev ? { ...prev, cover_image: data.link } : prev));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Add new item
  const handleAddItem = (type: "ingredients" | "instructions", value: string) => {
    if (!value.trim() || !recipe) return;
    setRecipe((prev) => (prev ? { ...prev, [type]: [...prev[type], value.trim()] } : prev));
  };

  // Delete item
  const handleDeleteItem = (type: "ingredients" | "instructions", index: number) => {
    setRecipe((prev) =>
      prev ? { ...prev, [type]: prev[type].filter((_, i) => i !== index) } : prev
    );
  };

  // Save edited item
  const handleSaveEdit = () => {
    if (!editingIndex.type || editingIndex.index === undefined || !recipe) return;

    const updatedItems = [...recipe[editingIndex.type]];
    updatedItems[editingIndex.index] = editText.trim();

    setRecipe((prev) => (prev ? { ...prev, [editingIndex.type]: updatedItems } : prev));
    setEditingIndex({});
    setEditText("");
  };

  // Submit recipe to the API
  const handleSubmitRecipe = async () => {
    if (!recipe) return;

    try {
      const response = await fetch("http://localhost:5000/api/recipes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        throw new Error("Failed to save recipe");
      }

      alert("Recipe saved successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save recipe. Please try again.");
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ textAlign: "center", fontWeight: "bold", marginBottom: 2 }}>
        Edit Duplicated Recipe: {recipe.name}
      </Typography>

      <Grid container spacing={4}>
        {/* Cover Image Section */}
        <Grid item xs={12} md={6}>
          <Box sx={{ textAlign: "center" }}>
            <CardMedia
              component="img"
              image={recipe.cover_image || "https://via.placeholder.com/400"}
              alt="Cover Image"
              sx={{ borderRadius: 2, height: "200px", objectFit: "cover", marginBottom: 2 }}
            />
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadIcon />}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Image"}
              <input type="file" hidden onChange={handleImageUpload} />
            </Button>
          </Box>
        </Grid>

        {/* Ingredients Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6">Ingredients</Typography>
          <List>
            {recipe.ingredients.map((ingredient, index) => (
              <ListItem key={index}>
                {editingIndex.type === "ingredients" && editingIndex.index === index ? (
                  <TextField
                    fullWidth
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                ) : (
                  <Typography>{ingredient}</Typography>
                )}
                <IconButton onClick={() => handleDeleteItem("ingredients", index)} color="error">
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setEditingIndex({ type: "ingredients", index });
                    setEditText(ingredient);
                  }}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
          <Box>
            <TextField
              fullWidth
              label="Add Ingredient"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={() => {
                handleAddItem("ingredients", newIngredient);
                setNewIngredient("");
              }}
            >
              Add Ingredient
            </Button>
          </Box>
        </Grid>

        {/* Submit Section */}
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleSubmitRecipe} fullWidth>
            Save Recipe
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditRecipePage;
