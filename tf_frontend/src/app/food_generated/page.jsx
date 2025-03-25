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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import { useSearchParams } from "next/navigation";
import Link from "next/link"; // Import Link from next/link
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Success icon
import ErrorIcon from "@mui/icons-material/Error"; // Error icon
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import ReactMarkdown from "react-markdown";

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

  const [open, setOpen] = useState(false); // State for modal visibility
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const [loading, setLoading] = useState(false); // State to track loading
  const [isSuccess, setIsSuccess] = useState(false); // State for success or failure


  const handleClose = () => {
    setOpen(false); // Close the modal
  };


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

        <div
  className="second"
  style={{
    display: "flex",
    flexDirection: "column", // Stack items vertically
    gap: "2rem", // Consistent spacing between sections
    alignItems: "center", // Center all items horizontally
    width: "100%", // Ensure it takes full width
  }}
>
  {/* Tags Section */}
  <Box
    sx={{
      backgroundColor: "#d9f8d9",
      padding: "1rem",
      borderRadius: "8px",
      width: "100%", // Full width for consistency
      maxWidth: "600px", // Limit width for readability
    }}
  >
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
          sx={{ borderRadius: "16px" }}
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
      <Button
        variant="contained"
        onClick={handleAddTag}
        startIcon={<AddIcon />}
        sx={{ minWidth: "100px" }}
      >
        Add
      </Button>
    </Box>
  </Box>

  {/* Cover Image Section */}
  <Box
    sx={{
      textAlign: "center",
      width: "100%", // Full width
      maxWidth: "800px", // Match the image’s maxWidth for consistency
    }}
  >
    <h2 className="mb-2 font-[18px]">อัพโหลดรูปภาพหน้าปก</h2>
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        backgroundColor: "#d9d9d9",
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      
      {coverImage ? (
        <CardMedia
          component="img"
          image={coverImage}
          alt="Cover Image"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <PhotoOutlinedIcon sx={{ fontSize: 50, color: "#aaa" }} />
        </Box>
      )}
    </Box>
    <Box sx={{ marginTop: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
      <Button
        variant="contained"
        component="label"
        startIcon={isUploading ? <CircularProgress size={20} /> : <UploadIcon />}
        size="large"
        sx={{ padding: "8px 16px" }}
      >
        {isUploading ? "Uploading..." : "Upload Image"}
        <input
          type="file"
          accept=".jpg, .jpeg, .png, .gif, .webp"
          hidden
          onChange={handleImageUpload}
          disabled={isUploading}
        />
      </Button>
      <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
        Supported formats: JPG, JPEG, PNG, GIF, WEBP
      </Typography>
    </Box>
  </Box>

  {/* Submit Section */}
  <Box sx={{ width: "100%", textAlign: "center" }}>
    <Button
      variant="contained"
      color="primary"
      onClick={async () => {
        console.log("Submit button clicked");
        setLoading(true);
        try {
          const sanitizeText = (text) => text.replace(/[^a-zA-Z0-9\sก-๙]/g, "").trim();
          const sanitizedCategory = sanitizeText(category);
          const sanitizedTags = tags.map(sanitizeText);
          const recipeData = {
            name: menuName,
            ingredients,
            instructions,
            cover_image: coverImage,
            category: sanitizedCategory,
            tags: sanitizedTags,
            characteristics,
            flavors,
            videos: videos.map((video) => ({
              title: video.title,
              url: `https://www.youtube.com/watch?v=${video.id}`,
            })),
          };
          const checkResponse = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/gemini/check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(recipeData),
          });
          if (!checkResponse.ok) throw new Error("Failed to validate recipe");
          const checkData = await checkResponse.json();
          if (checkData.status === "Safe") {
            const submitResponse = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/api/recipes/submit`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(recipeData),
            });
            if (!submitResponse.ok) throw new Error("Failed to save recipe");
            setSuccessMessage("Recipe successfully submitted!");
            setIsSuccess(true);
            setOpen(true);
          } else {
            setSuccessMessage(
              checkData.status === "Not Safe"
                ? "Recipe validation failed: " + checkData.unsafe_parts
                : <>
                    พวกเราตรวจพบวัตถุดิบ หรือวิธีการทำที่อันตราย.
                    <ReactMarkdown>{checkData.reason}</ReactMarkdown>
                  </>
            );
            setIsSuccess(false);
            setOpen(true);
          }
        } catch (error) {
          console.error("Error:", error);
          setSuccessMessage("An error occurred during submission.");
          setIsSuccess(false);
          setOpen(true);
        } finally {
          setLoading(false);
        }
      }}
      size="large"
      sx={{ minWidth: "200px" }}
    >
      Submit Recipe
    </Button>
  </Box>
</div>


      {/* Modal */}
      <Dialog open={open} onClose={handleClose} className="w-full h-full">
        <div>
        <DialogTitle>Submission Status</DialogTitle>
        <DialogContent className=" w-full h-full flex justify-center items-center left-0">
          {/* Display icons based on success or failure */}
          {loading ? (
            <CircularProgress size={50} color="primary" />
          ) : isSuccess ? (
            <CheckCircleIcon color="success" style={{ fontSize: 50 }} />
          ) : (
            <ErrorIcon color="error" style={{ fontSize: 50 }} />
          )}

          <p>{successMessage}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>

          {/* Redirect to available recipes page when successful */}
          {successMessage === "Recipe successfully submitted!" && (
            <Link href="/foodview/available" passHref>
              <Button color="primary">Go to Available Recipes</Button>
            </Link>
          )}
        </DialogActions>
        </div>
      </Dialog>


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
