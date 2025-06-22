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

// Paths to your JSON files
const membersFilePath = path.join(process.cwd(), "models", "members.json");
const subscriptionsFilePath = path.join(
  process.cwd(),
  "models",
  "subscriptions.json"
);

// --- MEMBERS ROUTES ---
app.get("/api/members", (req, res) => {
  const data = fs.readFileSync(membersFilePath, "utf-8");
  res.json(JSON.parse(data));
});

app.post("/api/members", (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const data = JSON.parse(fs.readFileSync(membersFilePath, "utf-8"));
    const newId = data.length ? Math.max(...data.map((m) => m.id)) + 1 : 1;

    const newMember = { id: newId, name, attendance: {} };
    data.push(newMember);
    fs.writeFileSync(membersFilePath, JSON.stringify(data, null, 2), "utf-8");

    res.status(201).json(newMember);
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/members/:id", (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    let data = JSON.parse(fs.readFileSync(membersFilePath, "utf-8"));

    if (!data.some((m) => m.id === memberId))
      return res.status(404).json({ error: "Member not found" });

    data = data.filter((m) => m.id !== memberId);
    fs.writeFileSync(membersFilePath, JSON.stringify(data, null, 2), "utf-8");

    res.status(204).end();
  } catch (err) {
    console.error("Error deleting member:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- SUBSCRIPTIONS ROUTES ---
app.get("/api/subscriptions", (req, res) => {
  const data = fs.readFileSync(subscriptionsFilePath, "utf-8");
  res.json(JSON.parse(data));
});

app.post("/api/subscriptions", (req, res) => {
  try {
    const { name, subscriptionType, startDate, isActive } = req.body;
    if (!name || !subscriptionType)
      return res
        .status(400)
        .json({ error: "Name and subscriptionType are required" });

    const data = JSON.parse(fs.readFileSync(subscriptionsFilePath, "utf-8"));
    const newId = data.length ? Math.max(...data.map((s) => s.id)) + 1 : 1;

    const newSubscription = {
      id: newId,
      name,
      subscriptionType,
      startDate: startDate || new Date().toISOString().split("T")[0],
      isActive: isActive !== undefined ? isActive : true,
    };

    data.push(newSubscription);
    fs.writeFileSync(
      subscriptionsFilePath,
      JSON.stringify(data, null, 2),
      "utf-8"
    );

    res.status(201).json(newSubscription);
  } catch (err) {
    console.error("Error adding subscription:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/subscriptions/:id", (req, res) => {
  try {
    const subscriptionId = parseInt(req.params.id);
    let data = JSON.parse(fs.readFileSync(subscriptionsFilePath, "utf-8"));

    if (!data.some((s) => s.id === subscriptionId))
      return res.status(404).json({ error: "Subscription not found" });

    data = data.filter((s) => s.id !== subscriptionId);
    fs.writeFileSync(
      subscriptionsFilePath,
      JSON.stringify(data, null, 2),
      "utf-8"
    );

    res.status(204).end();
  } catch (err) {
    console.error("Error deleting subscription:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
