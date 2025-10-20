// routes/members.js
import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const membersFilePath = path.join(process.cwd(), "models", "members.json");

router.get("/", (req, res) => {
  const data = fs.readFileSync(membersFilePath, "utf-8");
  res.json(JSON.parse(data));
});

router.post("/", (req, res) => {
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

router.delete("/:id", (req, res) => {
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

// NEW ROUTE: Update attendance for a specific month of a member
router.put("/:id/attendance/:month", (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    const month = req.params.month;
    const attendanceUpdate = req.body; // Expecting { presentDates: [], count: number, total: number }

    if (
      !attendanceUpdate ||
      !Array.isArray(attendanceUpdate.presentDates) ||
      typeof attendanceUpdate.count !== "number" ||
      typeof attendanceUpdate.total !== "number"
    ) {
      return res.status(400).json({ error: "Invalid attendance data format" });
    }

    const data = JSON.parse(fs.readFileSync(membersFilePath, "utf-8"));
    const memberIndex = data.findIndex((m) => m.id === memberId);

    if (memberIndex === -1) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Update attendance for the specified month
    data[memberIndex].attendance[month] = attendanceUpdate;

    fs.writeFileSync(membersFilePath, JSON.stringify(data, null, 2), "utf-8");

    res
      .status(200)
      .json({ message: "Attendance updated", attendance: attendanceUpdate });
  } catch (err) {
    console.error("Error updating attendance:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
