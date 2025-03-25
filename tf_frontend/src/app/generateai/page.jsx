'use client';

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Stack,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Fade
} from "@mui/material";
import { useRouter } from "next/navigation";

const GeneratePage = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();
  const [label, setLabel] = useState("Enter your prompt");
  const [inputValue, setInputValue] = useState("");
  

  const examplePrompts = [
    "ตัวอย่าง.. กะเพราไก่ สูตรเผ็ดน้อย",
    "ตัวอย่าง.. แกงเขียวหวานสำหรับคนรักสุขภาพ เน้นวัตถุดิบไขมันต่ำ",
    "ตัวอย่าง.. ต้มยำกุ้ง",
    "ตัวอย่าง.. เมนูอาหารย่อยง่าย สำหรับคนป่วยที่เพิ่งผ่านการผ่าตัด",
    "ตัวอย่าง.. อาหารสำหรับคนความดันสูง",
  ];

  useEffect(() => {
    // Function to set a random label
    const updateLabel = () => {
      const randomPrompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
      setLabel(randomPrompt);
    };

    // Change label every 5 seconds
    const interval = setInterval(updateLabel, 5000);

    // Cleanup interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  
  const handleGenerate = async () => {
    const maxRetries = 3;
    let retryCount = 0;
    setLoading(true);
    setError("");
  
    try {
      let rawResponse = "";
      let recipeData = {};
      let videos = [];
  
      // Step 1: Generate recipe content with safety check
      while (retryCount < maxRetries) {
        try {
          console.log(`Attempt ${retryCount + 1}: Generating recipe...`);
          const generateRes = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/gemini/generate`, {
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
          console.log("Raw Response from /generate API:", generateData);
          rawResponse = generateData.response; // Assuming response contains the raw text
  
          // Check safety status from /generate API
          const { is_safe, reason, fix } = generateData;
          if (is_safe === false) {
            setError(`สูตรอาหารนี้ไม่ปลอดภัย\nเหตุผล: ${reason}\nวิธีแก้ไข: ${fix}`);
            setLoading(false);
            return; // Exit if not safe
          }
  
          if (rawResponse) break; // Exit loop if raw response is valid and safe
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
      const parseRes = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/gemini/parse`, {
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
  
      // Check the 'status' field in the parsed response
      if (recipeData.danger_check.status && recipeData.danger_check.status.toLowerCase() === "not safe") {
        const reason = recipeData.danger_check.reason || "ไม่ระบุเหตุผล";
        const fix = recipeData.danger_check.fix || "ไม่มีวิธีแก้ไขระบุ";
        setError(`สูตรอาหารนี้ไม่ปลอดภัย\n
          เหตุผล: ${reason}\n
          วิธีแก้ไข: ${fix}`);
        setLoading(false); // Stop loading
        return; // Exit the function to prevent further processing
      }
  
      // Step 3: Store parsed data in sessionStorage (only if safe)
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
  
      // Step 4: Search YouTube videos (only if safe)
      const searchKeyword = `วิธีทำ ${recipeData.menuName}`;
      console.log(`Searching YouTube videos: ${searchKeyword}`);
      const youtubeRes = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/youtube/search`, {
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
  
      // Step 5: Redirect to the result page (only if safe)
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
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 5 }}>
      <Fade in={true} timeout={1000}>
        <Card sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              ค้นหาสูตรอาหารที่คุณต้องการไม่เจอใช่ไหม?
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              ลองสร้างสูตรอาหารที่ตรงตามคุณต้องการเองเลยสิ!
            </Typography>
            <TextField
              fullWidth
              label={label} // Dynamically updated label
              variant="outlined"
              multiline
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              helperText="เช่น 'สูตรเค้กช็อกโกแลตวีแกน' หรือ 'อาหารเช้าทำง่ายด้วยไข่'"
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleGenerate}
              disabled={loading || !prompt}
              sx={{ py: 1.5, fontSize: '1.1rem' }}
            >
              {loading ? <CircularProgress size={24} /> : "Generate & Search"}
            </Button>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}
          </Stack>
        </Card>
      </Fade>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>ต้องเข้าสู่ระบบ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            กรุณาเข้าสู่ระบบเพื่อใช้ฟีเจอร์นี้ หากคุณเป็นสมาชิกอยู่แล้ว กรุณาเข้าสู่ระบบอีกครั้ง
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            ยกเลิก
          </Button>
          <Button onClick={handleCloseDialog} color="primary" autoFocus>
            เข้าสู่ระบบ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GeneratePage;
