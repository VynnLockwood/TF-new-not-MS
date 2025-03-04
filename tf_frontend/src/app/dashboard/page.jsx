'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  CircularProgress,
  Menu,
  MenuItem,
  IconButton,
  Checkbox,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [filters, setFilters] = useState({
    name: true,
    ingredients: false,
    characteristics: false,
    flavors: false,
    tags: false,
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndRecipes = async () => {
      try {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include',
        });
        const userData = await userResponse.json();

        if (!userData.valid) {
          router.push('/login?error=invalid_session');
          return;
        }

        setUser({
          name: userData.user.name,
          email: userData.user.email,
          picture: userData.user.picture || '/default-avatar.png',
        });

        const recipeResponse = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/api/recipes`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!recipeResponse.ok) throw new Error('Failed to fetch recipes');

        const { recipes: fetchedRecipes, tags: fetchedTags, categories: fetchedCategories } =
          await recipeResponse.json();

        const shuffledRecipes = fetchedRecipes.sort(() => 0.5 - Math.random());
        setRecipes(fetchedRecipes);
        setFilteredRecipes(shuffledRecipes.slice(0, 6));
        setTags(fetchedTags || []);
        setCategories(fetchedCategories || []);
      } catch (error) {
        console.error('Error fetching user or recipes:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRecipes();
  }, [router]);

  const handleSearchClick = async () => {
    if (!searchQuery.trim()) {
      setFilteredRecipes(recipes);
      return;
    }

    setSearching(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_END_URL}/api/recipes/search?${new URLSearchParams({
          query: searchQuery,
        }).toString()}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      setFilteredRecipes(data || []);
    } catch (error) {
      console.error('Error during search:', error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleFilterToggle = (filterKey) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: !prevFilters[filterKey],
    }));
    setAnchorEl(null);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewRecipe = (recipeId) => {
    router.push(`/foodview/users/${recipeId}`);
  };

  const handleTagChange = (event) => {
    const tag = event.target.value;
    setSelectedTag(tag);

    if (tag) {
      const filteredByTag = recipes.filter((recipe) =>
        recipe.tags && recipe.tags.includes(tag)
      );
      setFilteredRecipes(filteredByTag.slice(0, 6));
    } else {
      const shuffledRecipes = recipes.sort(() => 0.5 - Math.random());
      setFilteredRecipes(shuffledRecipes.slice(0, 6));
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', padding: 5 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          กำลังโหลด...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ textAlign: 'center', padding: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
          ค้นหาสูตรอาหารง่ายๆ พร้อมเริ่มทำอาหารได้เลย!
        </Typography>
        <Typography variant="h6" sx={{ color: 'gray', marginBottom: 2 }}>
          ลองค้นหาสูตรอาหารไทยยอดนิยม หรือใช้ตัวกรองเพื่อค้นหาสูตรที่เหมาะกับคุณ!
        </Typography>
      </Box>
      <Box sx={{ padding: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <TextField
          variant="outlined"
          placeholder="ค้นหาสูตรอาหาร"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2, width: '100%', maxWidth: 400 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearchClick}
            startIcon={<SearchIcon />}
            disabled={searching}
          >
            {searching ? 'กำลังค้นหา...' : 'ค้นหา'}
          </Button>
          <IconButton
            aria-label="Filter"
            onClick={handleMenuClick}
            color="primary"
          >
            <FilterListIcon />
          </IconButton>
        </Box>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => handleFilterToggle('name')}>
            <Checkbox checked={filters.name} />
            ชื่อสูตรอาหาร
          </MenuItem>
          <MenuItem onClick={() => handleFilterToggle('ingredients')}>
            <Checkbox checked={filters.ingredients} />
            ส่วนผสม
          </MenuItem>
          <MenuItem onClick={() => handleFilterToggle('characteristics')}>
            <Checkbox checked={filters.characteristics} />
            ลักษณะอาหาร
          </MenuItem>
          <MenuItem onClick={() => handleFilterToggle('flavors')}>
            <Checkbox checked={filters.flavors} />
            รสชาติ
          </MenuItem>
          <MenuItem onClick={() => handleFilterToggle('tags')}>
            <Checkbox checked={filters.tags} />
            แท็ก
          </MenuItem>
        </Menu>
        <FormControl sx={{ mt: 2, minWidth: 200 }}>
          <InputLabel>กรองตามแท็ก</InputLabel>
          <Select value={selectedTag} onChange={handleTagChange} label="กรองตามแท็ก">
            <MenuItem value="">ทั้งหมด</MenuItem>
            {tags.map((tag) => (
              <MenuItem key={tag} value={tag}>
                {tag}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 3 }}>
          สูตรอาหารที่แนะนำ
        </Typography>
        <Grid container spacing={3}>
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
                <Card
                  sx={{
                    maxWidth: 345,
                    margin: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={recipe.cover_image || 'https://via.placeholder.com/400'}
                    alt={recipe.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="h6">{recipe.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Created by {recipe.creator_name}
                      <br />
                      Category: {recipe.category || 'Uncategorized'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {recipe.tags.length > 0 ? recipe.tags.join(', ') : 'No Tags'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary" onClick={() => handleViewRecipe(recipe.id)}>
                      View Recipe
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="body1">ไม่พบสูตรอาหาร</Typography>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
