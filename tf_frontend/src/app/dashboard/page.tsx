'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
  CardMedia,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

const drawerWidth = 240;

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; picture: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
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
            picture: data.user.picture || null,
          });
        } else {
          router.push('/login?error=invalid_session');
        }
      } catch {
        router.push('/login?error=server_error');
      }
      setLoading(false);
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleGenerateAI = () => {
    router.push('/generateai'); // Redirect to /generateai
  };

  const drawer = (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Foodie Dashboard</Typography>
      <Divider sx={{ marginY: 2 }} />
      <List>
        {['Recipes', 'Categories', 'Favorites'].map((text) => (
          <ListItem button key={text}>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (loading) {
    return <Box sx={{ textAlign: 'center', padding: 5 }}>Loading...</Box>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'primary.main',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ marginRight: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          marginLeft: { sm: `${drawerWidth}px` },
          marginTop: 8,
        }}
      >
        <Container>
          <Box sx={{ textAlign: 'center', marginBottom: 5 }}>
            <CardMedia
              component="img"
              image={user?.picture || '/default-avatar.png'}
              alt="User Avatar"
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                margin: '0 auto',
              }}
            />
            <Typography variant="h5" sx={{ marginTop: 2 }}>{user?.name}</Typography>
            <Typography variant="body1" color="text.secondary">{user?.email}</Typography>
          </Box>

          <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ padding: 2, fontWeight: 'bold' }}
              onClick={handleGenerateAI} // Redirect on button click
            >
              Generate Recipe
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
