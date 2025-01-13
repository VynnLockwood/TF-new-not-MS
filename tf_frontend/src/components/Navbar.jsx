'use client';

import React, { useEffect } from 'react';
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
import { useUser } from '@/context/UserContext'; // Import useUser from context

const Navbar = () => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState(null); // For mobile menu
  const [userMenuAnchor, setUserMenuAnchor] = React.useState(null); // For user menu
  const { user, fetchUser, setUser } = useUser(); // Access user context

  const isMenuOpen = Boolean(anchorEl); // Check if mobile menu is open
  const isUserMenuOpen = Boolean(userMenuAnchor); // Check if user menu is open

  // Fetch user only on initial mount if not already fetched
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  // Handlers for menus
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  // Navigate to a specific path
  const navigateTo = (path) => {
    handleMenuClose();
    router.push(path);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null); // Clear user data in context
      sessionStorage.removeItem('user'); // Clear cached user data
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Navigate to user profile
  const handleProfileClick = () => {
    if (user?.id) {
      router.push(`/users/${user.id}/profile`); // Navigate to user's profile page
      handleUserMenuClose();
    } else {
      console.error('User ID is not available');
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
          <Button color="inherit" onClick={() => router.push('/foodview/available')}>
            รวมสูตรอาหาร
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
            <MenuItem onClick={() => navigateTo('/foodview/available')}>รวมสูตรอาหาร</MenuItem>
          </Menu>
        </Box>

        {/* User Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              {/* Avatar and User Menu */}
              <Avatar
                alt={user.name}
                src={user.picture}
                sx={{ cursor: 'pointer' }}
                onClick={handleUserMenuOpen}
              />
              <Menu
                anchorEl={userMenuAnchor}
                open={isUserMenuOpen}
                onClose={handleUserMenuClose}
              >
                <MenuItem onClick={handleProfileClick}>ดูโปรไฟล์</MenuItem>
                <MenuItem onClick={handleLogout}>ออกจากระบบ</MenuItem>
              </Menu>
              <Typography
                variant="body1"
                sx={{ cursor: 'pointer' }}
                onClick={handleProfileClick}
              >
                {user.name}
              </Typography>
            </>
          ) : (
            <Button
              variant="outlined"
              startIcon={<LoginIcon />}
              onClick={() => router.push('/login')}
            >
              เข้าสู่ระบบ
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
