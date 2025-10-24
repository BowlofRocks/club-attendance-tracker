// routes/analytics.js
import express from "express";
import db from "../db/index.js";

const router = express.Router();

// Get attendance trends over time
router.get("/attendance-trends", (req, res) => {
  const { days = 30 } = req.query;
  
  const query = `
    SELECT 
      attendance_date,
      COUNT(DISTINCT member_id) as member_count
    FROM attendance
    WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    GROUP BY attendance_date
    ORDER BY attendance_date ASC
  `;
  
  db.query(query, [days], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results);
  });
});

// Get member attendance distribution
router.get("/member-distribution", (req, res) => {
  const query = `
    SELECT 
      m.member_id,
      CONCAT(m.first_name, ' ', m.last_name) as name,
      COUNT(a.attendance_date) as attendance_count
    FROM member m
    LEFT JOIN attendance a ON m.member_id = a.member_id
    GROUP BY m.member_id, m.first_name, m.last_name
    ORDER BY attendance_count DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results);
  });
});

// Get attendance statistics
router.get("/stats", (req, res) => {
  const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM member) as total_members,
      (SELECT COUNT(DISTINCT member_id) FROM attendance) as active_members,
      (SELECT COUNT(DISTINCT attendance_date) FROM attendance) as total_meeting_days,
      (SELECT COUNT(*) FROM attendance WHERE attendance_date = CURDATE()) as today_attendance
  `;
  
  db.query(statsQuery, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results[0]);
  });
});

// Get tier distribution
router.get("/tier-distribution", (req, res) => {
  const query = `
    SELECT 
      t.type as tier_name,
      COUNT(m.member_id) as count
    FROM member m
    JOIN tier t ON m.tier_id = t.tier_id
    GROUP BY t.type
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results);
  });
});

// Get payment status distribution
router.get("/payment-distribution", (req, res) => {
  const query = `
    SELECT 
      ps.type as status_name,
      COUNT(m.member_id) as count
    FROM member m
    JOIN pay_status ps ON m.pay_status_id = ps.status_id
    GROUP BY ps.type
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results);
  });
});

export default router;
