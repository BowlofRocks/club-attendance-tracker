// routes/attendance.js
import express from "express";
import db from "../db/index.js";

const router = express.Router();

// Get attendance data for all members with optional date filtering
router.get("/", (req, res) => {
  const { date, start_date, end_date } = req.query;
  
  let query = `
    SELECT 
      a.member_id,
      a.attendance_date,
      a.attendance_time,
      CONCAT(m.first_name, ' ', m.last_name) as member_name,
      m.first_name,
      m.last_name,
      t.type as tier_type,
      ps.type as pay_status
    FROM attendance a
    JOIN member m ON a.member_id = m.member_id
    LEFT JOIN tier t ON m.tier_id = t.tier_id
    LEFT JOIN pay_status ps ON m.pay_status_id = ps.status_id
  `;
  
  let queryParams = [];
  
  if (date) {
    query += " WHERE a.attendance_date = ?";
    queryParams.push(date);
  } else if (start_date && end_date) {
    query += " WHERE a.attendance_date BETWEEN ? AND ?";
    queryParams.push(start_date, end_date);
  }
  
  query += " ORDER BY a.attendance_date DESC, m.first_name ASC";
  
  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results);
  });
});

// Get attendance summary for all members (count of days attended)
router.get("/summary", (req, res) => {
  const { start_date, end_date } = req.query;
  
  let query = `
    SELECT 
      m.member_id as id,
      CONCAT(m.first_name, ' ', m.last_name) as name,
      m.first_name,
      m.last_name,
      m.email,
      m.phone,
      m.join_date,
      t.type as tier_type,
      ps.type as pay_status,
      COUNT(a.attendance_date) as days_attended,
      COALESCE(total_days.total, 0) as total_possible_days
    FROM member m
    LEFT JOIN attendance a ON m.member_id = a.member_id
    LEFT JOIN tier t ON m.tier_id = t.tier_id
    LEFT JOIN pay_status ps ON m.pay_status_id = ps.status_id
    LEFT JOIN (
      SELECT COUNT(DISTINCT attendance_date) as total
      FROM attendance
      ${start_date && end_date ? 'WHERE attendance_date BETWEEN ? AND ?' : ''}
    ) total_days ON 1=1
  `;
  
  let queryParams = [];
  
  if (start_date && end_date) {
    query += " WHERE a.attendance_date BETWEEN ? AND ?";
    queryParams.push(start_date, end_date, start_date, end_date);
  }
  
  query += `
    GROUP BY m.member_id, m.first_name, m.last_name, m.email, m.phone, 
             m.join_date, t.type, ps.type, total_days.total
    ORDER BY m.first_name ASC
  `;
  
  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Calculate attendance percentage
    const summaryData = results.map(member => ({
      ...member,
      attendance_percentage: member.total_possible_days > 0 
        ? Math.round((member.days_attended / member.total_possible_days) * 100)
        : 0
    }));
    
    res.json(summaryData);
  });
});

// Mark attendance for a member on a specific date
router.post("/mark", (req, res) => {
  const { member_id, attendance_date = new Date().toISOString().split('T')[0], attendance_time = '00:00' } = req.body;
  
  if (!member_id) {
    return res.status(400).json({ error: "Member ID is required" });
  }
  
  const query = `
    INSERT INTO attendance (member_id, attendance_date, attendance_time, attendance_member_id)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE attendance_time = ?
  `;
  
  db.query(query, [member_id, attendance_date, attendance_time, member_id, attendance_time], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ 
      message: 'Attendance marked successfully',
      member_id,
      attendance_date,
      attendance_time
    });
  });
});

// Remove attendance for a member on a specific date
router.delete("/remove", (req, res) => {
  const { member_id, attendance_date } = req.body;
  
  if (!member_id || !attendance_date) {
    return res.status(400).json({ error: "Member ID and attendance date are required" });
  }
  
  const query = "DELETE FROM attendance WHERE member_id = ? AND attendance_date = ?";
  
  db.query(query, [member_id, attendance_date], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    res.json({ message: 'Attendance removed successfully' });
  });
});

// Reset all attendance records (delete all attendance data)
router.delete("/reset-all", (req, res) => {
  const query = "DELETE FROM attendance";
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ 
      message: 'All attendance records have been reset',
      deleted_records: result.affectedRows
    });
  });
});

export default router;
