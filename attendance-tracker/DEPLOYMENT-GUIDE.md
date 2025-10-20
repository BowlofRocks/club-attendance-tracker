# Club Attendance Tracker - Namecheap cPanel Deployment Guide

This guide walks you through deploying your Club Attendance Tracker application to Namecheap hosting using cPanel with Node.js support.

## Prerequisites

- Namecheap Stellar Plus hosting plan (or higher with Node.js support)
- Access to cPanel
- MySQL database access
- Your application code ready for deployment

## Step 1: Prepare Your Application for Deployment

### 1.1 Build the Application
Run the deployment build script from your project root:

```bash
npm run build:deployment
```

This will:
- Install all dependencies
- Build the React frontend
- Create a `deployment` folder with all necessary files
- Set up the correct package.json for production

### 1.2 Files Created for Deployment
The deployment folder will contain:
- `app.js` - Main entry point for Node.js
- `package.json` - Production dependencies only
- `server/` - Backend Express.js application
- `dist/` - Built React frontend
- `.env.example` - Environment variable template

## Step 2: Set Up MySQL Database

### 2.1 Create Database in cPanel
1. Log into your Namecheap cPanel
2. Go to **MySQL Databases**
3. Create a new database (e.g., `your_username_attendance`)
4. Create a database user with a secure password
5. Add the user to the database with all privileges
6. Note down:
   - Database name
   - Database username
   - Database password
   - Database host (usually `localhost`)

### 2.2 Import Your Database Schema
If you have existing database tables:
1. Export your local database schema
2. Use **phpMyAdmin** in cPanel to import the schema
3. Or use the **MySQL Database Wizard** to create tables manually

## Step 3: Upload Your Application

### 3.1 Upload Files via File Manager
1. In cPanel, open **File Manager**
2. Navigate to your domain's folder (usually `public_html/yourdomain.com` or similar)
3. Upload the contents of the `deployment` folder to this directory
4. Extract any zip files if needed

### 3.2 Alternative: Upload via FTP/SFTP
Use your preferred FTP client with your Namecheap hosting credentials to upload the deployment files.

## Step 4: Configure Environment Variables

### 4.1 Create .env File
1. In cPanel File Manager, navigate to your app directory
2. Rename `.env.example` to `.env`
3. Edit the `.env` file with your actual values:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_namecheap_db_user
DB_PASSWORD=your_namecheap_db_password
DB_NAME=your_namecheap_db_name
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=production

# Auth0 Configuration (if using Auth0)
REACT_APP_AUTH0_DOMAIN=your-auth0-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-auth0-client-id

# Application URL
REACT_APP_API_BASE_URL=/api
```

## Step 5: Set Up Node.js Application in cPanel

### 5.1 Create Node.js App
1. In cPanel, find and click **Node.js Apps** (may be under "Software" section)
2. Click **Create Application**
3. Fill in the details:
   - **Node.js version**: Select the latest LTS version (18.x or higher)
   - **Application mode**: Production
   - **Application root**: Path to your application folder
   - **Application URL**: Your domain or subdomain
   - **Application startup file**: `app.js`

### 5.2 Configure Application Settings
1. After creating the app, click **Enter to the app directory**
2. Install production dependencies:
   ```bash
   npm install --production
   ```
3. Go back to the Node.js Apps interface
4. Click **Start** to start your application

## Step 6: Configure Domain/Subdomain (if needed)

### 6.1 For Main Domain
If deploying to your main domain, ensure your Node.js app is configured to serve from the root.

### 6.2 For Subdomain
1. In cPanel, go to **Subdomains**
2. Create a subdomain (e.g., `app.yourdomain.com`)
3. Point it to your Node.js application directory
4. Update your Node.js app configuration to use the subdomain

## Step 7: Test Your Deployment

### 7.1 Access Your Application
1. Visit your domain/subdomain in a web browser
2. Verify the frontend loads correctly
3. Test API endpoints by trying to interact with your attendance tracker features

### 7.2 Check Logs
1. In cPanel Node.js Apps, click on your application
2. Check the **Error Logs** and **Access Logs** for any issues
3. Common issues:
   - Database connection errors
   - Missing environment variables
   - File permission issues

## Step 8: SSL Certificate (Recommended)

### 8.1 Enable SSL
1. In cPanel, go to **SSL/TLS**
2. Install an SSL certificate (Namecheap often provides free Let's Encrypt certificates)
3. Enable **Force HTTPS Redirect**

## Troubleshooting

### Common Issues and Solutions

**1. "Cannot connect to database"**
- Verify database credentials in `.env` file
- Ensure database user has proper permissions
- Check database host (usually `localhost` for shared hosting)

**2. "404 Not Found" for React routes**
- Ensure your server.js has the catch-all route for React Router
- Verify the `dist` folder was uploaded correctly

**3. "Module not found" errors**
- Run `npm install --production` in the application directory
- Check that all dependencies are listed in package.json

**4. App won't start**
- Check the Error Logs in Node.js Apps section
- Verify `app.js` is the correct startup file
- Ensure Node.js version is compatible

**5. API requests failing**
- Check if API endpoints are accessible at `/api/*`
- Verify CORS configuration in server.js
- Check network tab in browser dev tools for error details

### Support Resources

- **Namecheap Support**: Available 24/7 for hosting-related issues
- **cPanel Documentation**: Comprehensive guides for cPanel features
- **Node.js Documentation**: For application-specific issues

## Maintenance

### Regular Updates
1. Test updates in your local development environment
2. Run the build script: `npm run build:deployment`
3. Upload only the changed files to minimize downtime
4. Restart the Node.js application if needed

### Monitoring
- Regularly check application logs in cPanel
- Monitor database performance
- Set up uptime monitoring if desired

---

## Quick Reference Commands

```bash
# Build for deployment
npm run build:deployment

# Install production dependencies (on server)
npm install --production

# Start application (usually handled by cPanel)
npm start
```

## File Structure After Deployment
```
your-app-directory/
├── app.js                 # Main entry point
├── package.json           # Production dependencies
├── .env                   # Environment variables
├── server/                # Backend API
│   ├── server.js
│   ├── routes/
│   ├── models/
│   └── ...
└── dist/                  # Built frontend
    ├── index.html
    ├── assets/
    └── ...
```

Good luck with your deployment! 🚀