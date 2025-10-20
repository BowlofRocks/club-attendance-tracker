# Club Attendance Tracker

A full-stack web application for tracking club member attendance, built with React + TypeScript frontend and Express.js backend.

## 🚀 Features

- **Frontend**: React + TypeScript + Vite with Material-UI components
- **Backend**: Express.js REST API with MySQL database
- **Authentication**: Auth0 integration
- **Deployment**: Configured for Namecheap cPanel hosting

## 🛠️ Technology Stack

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- Material-UI (@mui/material) for UI components
- Auth0 React SDK for authentication
- React Router for navigation

### Backend
- Express.js server
- MySQL database with mysql2 driver
- CORS enabled for frontend communication
- Environment-based configuration

## 💻 Development

### Prerequisites
- Node.js 18+ and npm
- MySQL database (local or remote)
- Auth0 account (optional, for authentication)

### Getting Started

1. **Clone and install dependencies**:
   ```bash
   npm install
   cd server && npm install
   ```

2. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Update database credentials and other configuration

3. **Start development servers**:
   ```bash
   npm run dev
   ```
   This starts both frontend (Vite) and backend (Express) concurrently.

4. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Available Scripts

- `npm run dev` - Start development servers (frontend + backend)
- `npm run build` - Build frontend for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run build:deployment` - Build and prepare for Namecheap deployment

## 🚀 Deployment

This application is configured for deployment on **Namecheap hosting with cPanel**.

### Quick Deployment

1. **Build for deployment**:
   ```bash
   npm run build:deployment
   ```

2. **Follow the detailed guide**: See [`DEPLOYMENT-GUIDE.md`](./DEPLOYMENT-GUIDE.md) for complete step-by-step instructions.

### Project Structure

```
club-attendance-tracker/
├── src/                    # React frontend source
├── server/                 # Express.js backend
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   ├── middleware/        # Custom middleware
│   └── server.js          # Main server file
├── public/                # Static frontend assets
├── dist/                  # Built frontend (after build)
├── app.js                 # Main entry point for hosting
├── package.json           # Frontend dependencies
├── DEPLOYMENT-GUIDE.md    # Detailed deployment instructions
└── .env.example           # Environment variables template
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
