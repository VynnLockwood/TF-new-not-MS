'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AppBar, Box, Button, Container, Divider, Drawer, IconButton, List, ListItem, ListItemText, Toolbar, Typography } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { styled } from '@mui/system';

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; picture: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Step 1: Call /api/auth/check to verify the session
        const sessionCheckResponse = await fetch('http://localhost:5000/api/auth/check', {
          method: 'GET',
          credentials: 'include',  // Include cookies with the request
        });

        if (!sessionCheckResponse.ok) {
          throw new Error('Session verification failed.');
        }

        const sessionData = await sessionCheckResponse.json();
        console.log('Session verified:', sessionData);

        if (sessionData.valid) {
          // If session is valid, set user data from the session response
          setUser({
            name: sessionData.user.name,
            email: sessionData.user.email,
            picture: sessionData.user.picture || null,
          });
        } else {
          // If session is invalid, redirect to login
          router.push('/login?error=invalid_session');
        }
      } catch (error) {
        console.error('Error verifying session:', error);
        router.push('/login?error=server_error');
      }
      setLoading(false);
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      // Call logout API or clear session data if needed
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies with the request
      });
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      router.push('/login');
    }
  };

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6">Foodie Dashboard</Typography>
          <Divider />
          <List>
            {['Recipes', 'Categories', 'Favorites'].map((text) => (
              <ListItem button key={text}>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', padding: 3 }}
      >
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 2,
                display: { sm: 'none' },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography>
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </Toolbar>
        </AppBar>

        <Container sx={{ marginTop: 10 }}>
          <Box sx={{ textAlign: 'center' }}>
            <img
              src={user?.picture || '/default-avatar.png'}
              alt="User Avatar"
              style={{ width: '100px', height: '100px', borderRadius: '50%' }}
            />
            <Typography variant="h5" sx={{ marginTop: 2 }}>
              {user?.name}
            </Typography>
            <Typography variant="body1" color="textSecondary">{user?.email}</Typography>
          </Box>

          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Featured Recipes</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ backgroundColor: '#fff', borderRadius: '8px', padding: 2 }}>
                <Typography variant="h6">Pad Krapow</Typography>
                <Typography variant="body2" color="textSecondary">A Thai classic with ground meat and basil.</Typography>
              </Box>
              <Box sx={{ backgroundColor: '#fff', borderRadius: '8px', padding: 2 }}>
                <Typography variant="h6">Green Curry</Typography>
                <Typography variant="body2" color="textSecondary">A creamy and spicy Thai green curry.</Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
