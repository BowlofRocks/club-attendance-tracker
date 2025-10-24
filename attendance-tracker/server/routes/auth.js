// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import db from "../db/index.js";

const router = express.Router();

// Login endpoint
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Find user by email from member table and join with user table
  const query = `
    SELECT 
      u.user_id,
      u.password,
      u.member_member_id,
      m.first_name,
      m.last_name,
      m.email,
      a.admin_id,
      a.role
    FROM member m
    JOIN user u ON m.member_id = u.member_member_id
    LEFT JOIN admin a ON m.member_id = a.member_id
    WHERE m.email = ?
  `;

  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];

    try {
      // Check if password starts with '$2' (bcrypt hash format)
      const isPasswordHashed = user.password.startsWith('$2');
      let passwordMatch = false;

      if (isPasswordHashed) {
        // Compare hashed password
        passwordMatch = await bcrypt.compare(password, user.password);
      } else {
        // For backward compatibility, compare plain text
        // (You should update all passwords to be hashed)
        passwordMatch = password === user.password;
        
        if (passwordMatch) {
          console.warn('⚠️ User logged in with unhashed password. Consider updating the password.');
        }
      }

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Successful login - return user info
      const userData = {
        user_id: user.user_id,
        member_id: user.member_member_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        is_admin: user.admin_id !== null,
        role: user.role || 'user'
      };

      res.json({
        message: 'Login successful',
        user: userData
      });

    } catch (error) {
      console.error('Password comparison error:', error);
      return res.status(500).json({ error: 'Authentication error' });
    }
  });
});

// Helper endpoint to hash a password (for creating/updating users)
router.post("/hash-password", async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    res.json({ hashedPassword });
  } catch (error) {
    console.error('Hashing error:', error);
    res.status(500).json({ error: 'Error hashing password' });
  }
});

// Request password reset - generates a reset token
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Check if user exists
  const findUserQuery = `
    SELECT m.member_id, m.email, m.first_name, m.last_name
    FROM member m
    JOIN user u ON m.member_id = u.member_member_id
    WHERE m.email = ?
  `;

  db.query(findUserQuery, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Always return success to prevent email enumeration
    if (results.length === 0) {
      return res.json({ 
        message: 'If an account exists with that email, a password reset link has been sent.',
        success: true
      });
    }

    const user = results[0];
    
    // Generate reset token (6-digit code for simplicity)
    const resetToken = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    // Store reset token in database
    // First, create the table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS password_reset (
        id INT PRIMARY KEY AUTO_INCREMENT,
        member_id INT NOT NULL,
        reset_token VARCHAR(6) NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE
      )
    `;

    db.query(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating table:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      // Insert reset token
      const insertTokenQuery = `
        INSERT INTO password_reset (member_id, reset_token, expires_at)
        VALUES (?, ?, ?)
      `;

      db.query(insertTokenQuery, [user.member_id, resetToken, expiresAt], (err) => {
        if (err) {
          console.error('Error inserting token:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // In a real app, you'd send this via email
        // For now, we'll return it in the response for testing
        console.log(`\n🔑 Password Reset Token for ${user.email}: ${resetToken}`);
        console.log(`   Expires at: ${expiresAt.toLocaleString()}\n`);

        res.json({ 
          message: 'If an account exists with that email, a password reset link has been sent.',
          success: true,
          // For development only - remove in production
          dev_token: resetToken,
          dev_expires: expiresAt
        });
      });
    });
  });
});

// Verify reset token and update password
router.post("/reset-password", async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ error: "Email, token, and new password are required" });
  }

  // Find valid reset token
  const findTokenQuery = `
    SELECT pr.id, pr.member_id, pr.expires_at, pr.used, m.email
    FROM password_reset pr
    JOIN member m ON pr.member_id = m.member_id
    WHERE m.email = ? AND pr.reset_token = ? AND pr.used = FALSE
    ORDER BY pr.created_at DESC
    LIMIT 1
  `;

  db.query(findTokenQuery, [email, token], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const resetRecord = results[0];

    // Check if token is expired
    if (new Date() > new Date(resetRecord.expires_at)) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    try {
      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      const updatePasswordQuery = `
        UPDATE user 
        SET password = ?
        WHERE member_member_id = ?
      `;

      db.query(updatePasswordQuery, [hashedPassword, resetRecord.member_id], (err) => {
        if (err) {
          console.error('Error updating password:', err);
          return res.status(500).json({ error: 'Error updating password' });
        }

        // Mark token as used
        const markUsedQuery = `UPDATE password_reset SET used = TRUE WHERE id = ?`;
        db.query(markUsedQuery, [resetRecord.id], (err) => {
          if (err) {
            console.error('Error marking token as used:', err);
          }

          res.json({ 
            message: 'Password has been reset successfully',
            success: true
          });
        });
      });
    } catch (error) {
      console.error('Password hashing error:', error);
      return res.status(500).json({ error: 'Error processing password reset' });
    }
  });
});

export default router;
