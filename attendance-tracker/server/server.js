import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/members", (req, res) => {
  const filePath = path.join(process.cwd(), "server", "models", "members.json");
  const data = fs.readFileSync(filePath, "utf-8");
  res.json(JSON.parse(data));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
