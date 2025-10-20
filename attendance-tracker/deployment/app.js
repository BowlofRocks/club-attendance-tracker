// Main entry point for Namecheap cPanel Node.js hosting
// This file starts the server from the server directory

import('./server/server.js')
  .then(() => {
    console.log('Club Attendance Tracker server started successfully');
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });