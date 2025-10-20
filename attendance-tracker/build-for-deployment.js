#!/usr/bin/env node

/**
 * Build script for Club Attendance Tracker deployment to Namecheap
 * This script prepares the application for production deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting build process for Namecheap deployment...\n');

try {
  // Step 1: Clean previous builds
  console.log('1. Cleaning previous builds...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
    console.log('   ✓ Cleaned dist folder');
  }

  // Step 2: Install dependencies
  console.log('2. Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  execSync('npm install --prefix server', { stdio: 'inherit' });
  console.log('   ✓ Dependencies installed');

  // Step 3: Build frontend
  console.log('3. Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('   ✓ Frontend built successfully');

  // Step 4: Copy production package.json
  console.log('4. Setting up production configuration...');
  if (fs.existsSync('package-production.json')) {
    fs.copyFileSync('package-production.json', 'package.json');
    console.log('   ✓ Production package.json copied');
  }

  // Step 5: Create deployment folder structure
  console.log('5. Creating deployment folder structure...');
  const deploymentDir = 'deployment';
  if (fs.existsSync(deploymentDir)) {
    fs.rmSync(deploymentDir, { recursive: true });
  }
  fs.mkdirSync(deploymentDir, { recursive: true });

  // Copy necessary files for deployment
  const filesToCopy = [
    'app.js',
    'package.json',
    '.env.example',
    'dist'
  ];

  filesToCopy.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const destPath = path.join(__dirname, deploymentDir, file);
    
    if (fs.existsSync(sourcePath)) {
      if (fs.statSync(sourcePath).isDirectory()) {
        fs.cpSync(sourcePath, destPath, { recursive: true });
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
      console.log(`   ✓ Copied ${file}`);
    }
  });

  // Copy server files excluding node_modules (to avoid symlink issues on Windows)
  console.log('   Copying server files...');
  const serverSourcePath = path.join(__dirname, 'server');
  const serverDestPath = path.join(__dirname, deploymentDir, 'server');
  
  if (fs.existsSync(serverSourcePath)) {
    fs.mkdirSync(serverDestPath, { recursive: true });
    
    // Copy server files excluding node_modules
    const serverFiles = fs.readdirSync(serverSourcePath);
    serverFiles.forEach(file => {
      if (file !== 'node_modules') {
        const sourceFile = path.join(serverSourcePath, file);
        const destFile = path.join(serverDestPath, file);
        
        if (fs.statSync(sourceFile).isDirectory()) {
          fs.cpSync(sourceFile, destFile, { recursive: true });
        } else {
          fs.copyFileSync(sourceFile, destFile);
        }
      }
    });
    
    // Copy server's package.json to deployment server folder
    const serverPackageJson = path.join(serverSourcePath, 'package.json');
    const destServerPackageJson = path.join(serverDestPath, 'package.json');
    if (fs.existsSync(serverPackageJson)) {
      fs.copyFileSync(serverPackageJson, destServerPackageJson);
    }
    
    console.log('   ✓ Copied server files (excluding node_modules)');
  }

  console.log('\n🎉 Build completed successfully!');
  console.log('📁 Deployment files are ready in the "deployment" folder');
  console.log('\nNext steps:');
  console.log('1. Upload the contents of the "deployment" folder to your Namecheap hosting');
  console.log('2. Set up your environment variables in cPanel (.env file)');
  console.log('3. In cPanel terminal, navigate to your app directory and run: npm install --production');
  console.log('4. Create your Node.js app in cPanel pointing to app.js');
  console.log('5. Set up your MySQL database');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}