'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navigateTo = (path) => {
    handleMenuClose();
    router.push(path);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box display="flex" alignItems="center">
          <img
            src="https://i.postimg.cc/sX2ntz2w/Wok-Asian-Food-Logo.png" // Replace with your logo URL
            alt="Logo"
            style={{ height: '40px', marginRight: '16px', cursor: 'pointer' }}
            onClick={() => router.push('/')}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => router.push('/')}
          >
            THAI FOODS
          </Typography>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
          <Button color="inherit" onClick={() => router.push('/')}>
            หน้าแรก
          </Button>
          <Button color="inherit" onClick={() => router.push('/generateai')}>
            สร้างสูตรอาหาร
          </Button>
          
        </Box>

        {/* Mobile Menu */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => navigateTo('/')}>หน้าแรก</MenuItem>
            <MenuItem onClick={() => navigateTo('/recipes')}>สร้างสูตรอาหาร</MenuItem>
            
          </Menu>
        </Box>

        {/* User Actions */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<LoginIcon />}
            onClick={() => router.push('/login')}
          >
            เข้าสู่ระบบ
          </Button>

        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
