'use client';

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null); // State for user information
  const isMenuOpen = Boolean(anchorEl);

  useEffect(() => {
    // Simulate user session check (replace with your backend API endpoint)
    const checkUserSession = async () => {
      try {
        const response = await fetch('http://localhost:5000/auth/check', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();

        if (data.valid) {
          setUser({
            name: data.user.name,
            email: data.user.email,
            picture: data.user.picture || '/default-avatar.png',
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
        setUser(null);
      }
    };

    checkUserSession();
  }, []);

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

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box display="flex" alignItems="center">
          <img
            src="https://i.postimg.cc/sX2ntz2w/Wok-Asian-Food-Logo.png"
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
            <MenuItem onClick={() => navigateTo('/generateai')}>สร้างสูตรอาหาร</MenuItem>
          </Menu>
        </Box>

        {/* User Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              <Avatar
                alt={user.name}
                src={user.picture}
                sx={{ cursor: 'pointer' }}
                onClick={handleMenuOpen}
              />
              <Typography variant="body1" sx={{ cursor: 'pointer' }}>
                {user.name}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                ออกจากระบบ
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                startIcon={<LoginIcon />}
                onClick={() => router.push('/login')}
              >
                เข้าสู่ระบบ
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
