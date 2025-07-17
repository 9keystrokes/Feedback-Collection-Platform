import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard as DashboardIcon,
  ExitToApp,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  // Don't show full navbar on public form pages
  const isPublicForm = location.pathname.startsWith('/form/');
  
  if (isPublicForm) {
    return (
      <AppBar position="static" elevation={1}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ cursor: 'pointer', textAlign: 'center' }}
            onClick={handleLogoClick}
          >
            Feedback Platform
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', position: 'relative', minHeight: 64 }}>
        <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', height: '100%' }}>
          {/* Empty box for left alignment, can add logo if needed */}
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ cursor: 'pointer', textAlign: 'center' }}
            onClick={handleLogoClick}
          >
            Feedback Platform
          </Typography>
        </Box>
        <Box sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', height: '100%' }}>
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                color="inherit"
                startIcon={<DashboardIcon />}
                onClick={() => navigate('/dashboard')}
                sx={{ mr: 2 }}
              >
                Dashboard
              </Button>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Welcome, {user?.name}
              </Typography>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { handleClose(); navigate('/dashboard'); }}>
                  <DashboardIcon sx={{ mr: 1 }} />
                  Dashboard
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ pr: 3 }}>
              <Button color="inherit" onClick={() => navigate('/login')} sx={{ mr: 1 }}>
                Login
              </Button>
              <Button 
                color="inherit" 
                variant="outlined" 
                onClick={() => navigate('/register')}
                sx={{ borderColor: 'white', '&:hover': { borderColor: 'white' } }}
              >
                Register
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
