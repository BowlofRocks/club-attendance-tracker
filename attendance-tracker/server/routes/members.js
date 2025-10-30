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
      CASE 
        WHEN DATEDIFF(CURDATE(), attendance_data.last_attendance_date) > 30 
             OR attendance_data.last_attendance_date IS NULL 
        THEN 'Inactive'
        ELSE ps.type
      END as pay_status,
      attendance_data.last_attendance_date,
      DATEDIFF(CURDATE(), attendance_data.last_attendance_date) as days_since_attendance,
      CASE WHEN a.admin_id IS NOT NULL THEN 1 ELSE 0 END as is_admin
    FROM member m
    LEFT JOIN tier t ON m.tier_id = t.tier_id
    LEFT JOIN pay_status ps ON m.pay_status_id = ps.status_id
    LEFT JOIN admin a ON m.member_id = a.member_id
    LEFT JOIN (
      SELECT member_id, MAX(attendance_date) as last_attendance_date
      FROM attendance
      GROUP BY member_id
    ) attendance_data ON m.member_id = attendance_data.member_id
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
      last_attendance_date: member.last_attendance_date,
      days_since_attendance: member.days_since_attendance,
      is_inactive: member.pay_status === 'Inactive',
      is_admin: member.is_admin === 1,
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

// Update a member
router.put("/:id", (req, res) => {
  const memberId = parseInt(req.params.id);
  const { email, phone, tier_type, pay_status, join_date } = req.body;
  
  // Convert tier_type to tier_id
  const tierMap = {
    'Free Trial': 1,
    'Guild Member': 2
  };
  
  // Convert pay_status to pay_status_id
  const statusMap = {
    'Paid': 1,
    'Pending': 2,
    'Overdue': 3,
    'Inactive': 4
  };
  
  const tier_id = tierMap[tier_type];
  const pay_status_id = statusMap[pay_status];
  
  if (!tier_id || !pay_status_id) {
    return res.status(400).json({ error: "Invalid tier type or pay status" });
  }
  
  // Format join_date properly for MySQL (convert MM/DD/YYYY to YYYY-MM-DD)
  let formattedJoinDate = join_date;
  if (join_date) {
    // Handle both Date object and string formats
    let date;
    if (typeof join_date === 'string') {
      // If it's MM/DD/YYYY format, parse it correctly
      const parts = join_date.split('/');
      if (parts.length === 3) {
        // MM/DD/YYYY -> create Date(year, month-1, day)
        date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
      } else {
        date = new Date(join_date);
      }
    } else {
      date = new Date(join_date);
    }
    
    if (!isNaN(date.getTime())) {
      formattedJoinDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
  }
  
  const query = `
    UPDATE member 
    SET email = ?, phone = ?, tier_id = ?, pay_status_id = ?, join_date = ?
    WHERE member_id = ?
  `;
  
  db.query(query, [email, phone, tier_id, pay_status_id, formattedJoinDate, memberId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json({ message: 'Member updated successfully' });
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

// Get payment reset status
router.get("/payment-reset/status", (req, res) => {
  const query = `
    SELECT 
      reset_date,
      notification_dismissed,
      YEAR(reset_date) as reset_year,
      MONTH(reset_date) as reset_month,
      YEAR(CURDATE()) as current_year,
      MONTH(CURDATE()) as current_month,
      DATEDIFF(CURDATE(), reset_date) as days_since_reset
    FROM payment_reset 
    ORDER BY reset_date DESC 
    LIMIT 1
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      // No reset record exists, need to initialize
      return res.json({
        needs_reset: true,
        last_reset_date: null,
        is_new_month: true,
        notification_dismissed: false
      });
    }
    
    const lastReset = results[0];
    const needsReset = (lastReset.current_year > lastReset.reset_year) || 
                       (lastReset.current_year === lastReset.reset_year && 
                        lastReset.current_month > lastReset.reset_month);
    
    res.json({
      needs_reset: needsReset,
      last_reset_date: lastReset.reset_date,
      days_since_reset: lastReset.days_since_reset,
      is_new_month: needsReset,
      notification_dismissed: lastReset.notification_dismissed === 1
    });
  });
});

// Perform payment reset
router.post("/payment-reset/reset", (req, res) => {
  // First, record the reset
  const recordResetQuery = `
    INSERT INTO payment_reset (reset_date, notification_dismissed) VALUES (CURDATE(), 0)
  `;
  
  db.query(recordResetQuery, (err) => {
    if (err) {
      console.error('Error recording reset:', err);
      return res.status(500).json({ error: 'Failed to record reset' });
    }
    
    // Reset all active member payments to Pending (status_id = 2)
    // Don't reset inactive members
    const resetPaymentsQuery = `
      UPDATE member m
      LEFT JOIN (
        SELECT member_id, MAX(attendance_date) as last_attendance
        FROM attendance
        GROUP BY member_id
      ) a ON m.member_id = a.member_id
      SET m.pay_status_id = 2
      WHERE (a.last_attendance IS NULL OR DATEDIFF(CURDATE(), a.last_attendance) <= 30)
        AND m.pay_status_id != 4
    `;
    
    db.query(resetPaymentsQuery, (err, result) => {
      if (err) {
        console.error('Error resetting payments:', err);
        return res.status(500).json({ error: 'Failed to reset payments' });
      }
      
      res.json({
        message: 'Payment reset completed successfully',
        members_reset: result.affectedRows,
        reset_date: new Date().toISOString().split('T')[0]
      });
    });
  });
});

// Dismiss reset notification
router.post("/payment-reset/dismiss", (req, res) => {
  const query = `
    UPDATE payment_reset 
    SET notification_dismissed = 1 
    WHERE reset_date = (SELECT MAX(r.reset_date) FROM (SELECT reset_date FROM payment_reset) as r)
  `;
  
  db.query(query, (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ message: 'Notification dismissed' });
  });
});

// Grant admin privileges to a member
router.post("/:id/grant-admin", (req, res) => {
  const memberId = parseInt(req.params.id);
  const defaultPassword = 'ChangeMe123!'; // Default password - user should change this
  
  // Check if member exists
  const checkMemberQuery = 'SELECT member_id, first_name, last_name FROM member WHERE member_id = ?';
  
  db.query(checkMemberQuery, [memberId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    const member = results[0];
    
    // Check if already admin
    const checkAdminQuery = 'SELECT admin_id FROM admin WHERE member_id = ?';
    
    db.query(checkAdminQuery, [memberId], (err, adminResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (adminResults.length > 0) {
        return res.status(400).json({ error: 'Member is already an admin' });
      }
      
      // Check if user account already exists
      const checkUserQuery = 'SELECT user_id FROM user WHERE member_member_id = ?';
      
      db.query(checkUserQuery, [memberId], (err, userResults) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Create user account if it doesn't exist
        const createUserIfNeeded = (callback) => {
          if (userResults.length === 0) {
            // User doesn't exist, create one with default password
            const createUserQuery = 'INSERT INTO user (password, member_member_id) VALUES (?, ?)';
            db.query(createUserQuery, [defaultPassword, memberId], (err) => {
              if (err) {
                console.error('Error creating user:', err);
                return res.status(500).json({ error: 'Failed to create user account' });
              }
              callback(true); // User was created
            });
          } else {
            callback(false); // User already exists
          }
        };
        
        createUserIfNeeded((userCreated) => {
          // Grant admin privileges
          const grantAdminQuery = 'INSERT INTO admin (member_id, role) VALUES (?, "admin")';
          
          db.query(grantAdminQuery, [memberId], (err) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Failed to grant admin privileges' });
            }
            
            const message = userCreated 
              ? `Admin privileges granted successfully! A login account has been created with default password: "${defaultPassword}". Please inform ${member.first_name} ${member.last_name} to change their password after first login.`
              : 'Admin privileges granted successfully!';
            
            res.json({ 
              message, 
              member_id: memberId,
              user_created: userCreated,
              default_password: userCreated ? defaultPassword : null
            });
          });
        });
      });
    });
  });
});

// Revoke admin privileges from a member
router.post("/:id/revoke-admin", (req, res) => {
  const memberId = parseInt(req.params.id);
  
  const revokeAdminQuery = 'DELETE FROM admin WHERE member_id = ?';
  
  db.query(revokeAdminQuery, [memberId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Member is not an admin' });
    }
    
    res.json({ message: 'Admin privileges revoked successfully', member_id: memberId });
  });
});

export default router;
