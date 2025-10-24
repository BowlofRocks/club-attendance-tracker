import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import './Nav.css';

const NavBar = () => {
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
          <Button component={Link} to="/members" className="nav-button">
            Members
          </Button>
          <Button component={Link} to="/contact" className="nav-button">
            Contact
          </Button>
          <Button component={Link} to="/login" className="nav-button">
            Login
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
