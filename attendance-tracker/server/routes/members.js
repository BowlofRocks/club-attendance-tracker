// routes/members.js
import express from "express";
import db from "../db/index.js";

const router = express.Router();

// Get all members with their tier and pay status info
router.get("/", (req, res) => {
  const query = `
    SELECT 
      m.member_id as id,
      CONCAT(m.first_name, ' ', m.last_name) as name,
      m.first_name,
      m.last_name,
      m.email,
      m.phone,
      m.join_date,
      t.type as tier_type,
      ps.type as pay_status
    FROM member m
    LEFT JOIN tier t ON m.tier_id = t.tier_id
    LEFT JOIN pay_status ps ON m.pay_status_id = ps.status_id
    ORDER BY m.member_id
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Format results to match your frontend expectations
    const members = results.map(member => ({
      id: member.id,
      name: member.name,
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone,
      join_date: member.join_date,
      tier_type: member.tier_type,
      pay_status: member.pay_status,
      attendance: {} // Will be populated from attendance table later
    }));
    
    res.json(members);
  });
});

// Add a new member
router.post("/", (req, res) => {
  const { first_name, last_name, email, phone, tier_id = 1, pay_status_id = 1 } = req.body;
  
  if (!first_name || !last_name) {
    return res.status(400).json({ error: "First name and last name are required" });
  }

  const query = `
    INSERT INTO member (first_name, last_name, email, phone, join_date, tier_id, pay_status_id)
    VALUES (?, ?, ?, ?, CURDATE(), ?, ?)
  `;
  
  db.query(query, [first_name, last_name, email, phone, tier_id, pay_status_id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const newMember = {
      id: result.insertId,
      name: `${first_name} ${last_name}`,
      first_name,
      last_name,
      email,
      phone,
      tier_id,
      pay_status_id,
      join_date: new Date().toISOString().split('T')[0]
    };
    
    res.status(201).json(newMember);
  });
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
