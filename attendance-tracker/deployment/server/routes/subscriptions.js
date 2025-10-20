// routes/subscriptions.js
import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const subscriptionsFilePath = path.join(
  process.cwd(),
  "models",
  "subscriptions.json"
);

router.get("/", (req, res) => {
  const data = fs.readFileSync(subscriptionsFilePath, "utf-8");
  res.json(JSON.parse(data));
});

router.post("/", (req, res) => {
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

router.delete("/:id", (req, res) => {
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

export default router;
