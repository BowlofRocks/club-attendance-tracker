// views/partials/Footer/Footer.tsx

import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

const features = [
  'Member registration',
  'Class attendance tracking',
  'Club announcements',
  'Contact form',
  'Admin dashboard',
];

const Footer = () => {
  return (
    <Box component="footer" bgcolor="primary.main" color="white" py={3} px={2} mt="auto">
      <Typography variant="h6" gutterBottom>
        Created by Paul Amago
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Features:
      </Typography>
      
      <List dense>
        {features.map((feature, index) => (
          <ListItem key={index} disableGutters>
            <ListItemText primary={`• ${feature}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Footer;
