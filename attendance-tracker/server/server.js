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

// Helper to get file path
const filePath = path.join(process.cwd(), "models", "members.json");

app.get("/api/members", (req, res) => {
  const filePath = path.join(process.cwd(), "models", "members.json");
  const data = fs.readFileSync(filePath, "utf-8");
  res.json(JSON.parse(data));
});

// POST - Add new member
app.post("/api/members", (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const newId = data.length ? Math.max(...data.map((m) => m.id)) + 1 : 1;

    const newMember = {
      id: newId,
      name,
      attendance: {},
    };

    data.push(newMember);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

    res.status(201).json(newMember);
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE - Remove member by ID
app.delete("/api/members/:id", (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    let data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const memberExists = data.some((m) => m.id === memberId);
    if (!memberExists)
      return res.status(404).json({ error: "Member not found" });

    data = data.filter((m) => m.id !== memberId);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

    res.status(204).end();
  } catch (err) {
    console.error("Error deleting member:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
