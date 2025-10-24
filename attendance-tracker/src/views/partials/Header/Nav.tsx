import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Nav.css';

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const checkLoginStatus = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsLoggedIn(true);
          setUserName(user.first_name);
        } catch (err) {
          console.error('Error parsing user data:', err);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
    
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserName('');
    navigate('/login');
  };

  return (
    <AppBar position="static" className="nav-app-bar">
      <Toolbar className="nav-toolbar">
        <Typography variant="h6" component="div" className="nav-title">
          Club Attendance Tracker
        </Typography>
        
        <Box className="nav-buttons-container">
          <Button component={Link} to="/" className="nav-button">
            Home
          </Button>
          {isLoggedIn && (
            <Button component={Link} to="/members" className="nav-button">
              Members
            </Button>
          )}
          <Button component={Link} to="/contact" className="nav-button">
            Contact
          </Button>
          
          {isLoggedIn ? (
            <>
              <Typography className="nav-user-name">
                Welcome, {userName}
              </Typography>
              <Button onClick={handleLogout} className="nav-button nav-logout-button">
                Logout
              </Button>
            </>
          ) : (
            <Button component={Link} to="/login" className="nav-button">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
