import express from "express";
import cors from "cors";
import db from "./db/index.js"; // your MySQL connection
import dotenv from "dotenv";
import membersRoutes from "./routes/members.js";
import subscriptionsRoutes from "./routes/subscriptions.js";
import attendanceRoutes from "./routes/attendance.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();
// Use PORT from environment (required for Namecheap) or fallback to 3001 for local dev
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
// For Namecheap, the built frontend will be in ../dist
app.use(express.static(path.join(__dirname, '../dist')));

// Test DB connection on server startup
db.connect((err) => {
  if (err) {
    console.error("Failed to connect to database:", err);
  } else {
    console.log("Connected to the database successfully!");
  }
});

app.use("/api/members", membersRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api/attendance", attendanceRoutes);

// Catch-all handler temporarily removed to avoid route parsing issues
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../dist/index.html'));
// });

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
