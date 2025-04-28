import React from 'react';
import { AppBar, Toolbar, Typography, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, CssBaseline, IconButton } from '@mui/material';
import { Dashboard, AccessTime, Person, Logout } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 220;

const menu = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Pointage', icon: <AccessTime />, path: '/attendance' },
  { text: 'Profil', icon: <Person />, path: '/profile' },
];

export default function ModernLayout({ children }) {
  const location = useLocation();
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f4f6fa' }}>
      <CssBaseline />
      <AppBar position="fixed" color="primary" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Pointage SaaS
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" component={Link} to="/logout">
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', background: '#fff' },
        }}
      >
        <Toolbar />
        <List>
          {menu.map((item) => (
            <ListItem button key={item.text} component={Link} to={item.path} selected={location.pathname === item.path}>
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'grey.600' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: `${drawerWidth}px` }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
