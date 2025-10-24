import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  multipleStatements: true
});

// Updated schema to match your diagram
const setupSQL = `
-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS club_attendance_tracker;
USE club_attendance_tracker;

-- Drop existing tables to recreate with new schema
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS member;
DROP TABLE IF EXISTS pay_status;
DROP TABLE IF EXISTS tier;

-- Create tier table
CREATE TABLE tier (
  tier_id INT PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(50) NOT NULL
);

-- Create pay_status table  
CREATE TABLE pay_status (
  status_id INT PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(50) NOT NULL
);

-- Create member table
CREATE TABLE member (
  member_id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  join_date DATE,
  tier_id INT,
  pay_status_id INT,
  FOREIGN KEY (tier_id) REFERENCES tier(tier_id),
  FOREIGN KEY (pay_status_id) REFERENCES pay_status(status_id)
);

-- Create user table (for authentication)
CREATE TABLE user (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  password CHAR(60) NOT NULL, -- for bcrypt hashed passwords
  member_member_id INT,
  FOREIGN KEY (member_member_id) REFERENCES member(member_id) ON DELETE CASCADE
);

-- Create admin table
CREATE TABLE admin (
  admin_id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT,
  role VARCHAR(50) DEFAULT 'admin',
  FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE
);

-- Create updated attendance table
CREATE TABLE attendance (
  member_id INT,
  attendance_date DATE,
  attendance_time VARCHAR(10),
  attendance_member_id INT, -- reference field from your design
  PRIMARY KEY (member_id, attendance_date),
  FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE
);

-- Insert tier data
INSERT INTO tier (tier_id, type) VALUES
(1, 'Free Trial'),
(2, 'Guild Member');

-- Insert pay status data
INSERT INTO pay_status (status_id, type) VALUES
(1, 'Paid'),
(2, 'Pending'),
(3, 'Overdue');

-- Insert sample members
INSERT INTO member (member_id, first_name, last_name, email, phone, join_date, tier_id, pay_status_id) VALUES
(1, 'David', 'Bell', 'david.bell@email.com', '555-0101', '2024-01-15', 1, 1),
(2, 'Tanner', 'Larson', 'tanner.larson@email.com', '555-0102', '2024-01-16', 2, 1),
(5, 'Nicholas', 'Black', 'nicholas.black@email.com', '555-0105', '2024-01-17', 2, 1),
(6, 'Alana', 'Black', 'alana.black@email.com', '555-0106', '2024-01-18', 1, 1),
(7, 'Evan', 'Meacham', 'evan.meacham@email.com', '555-0107', '2024-01-19', 2, 2);

-- Insert sample admin (making David Bell an admin)
INSERT INTO admin (admin_id, member_id, role) VALUES
(1, 1, 'admin');

-- Insert sample user accounts (placeholder passwords - you'll hash these properly later)
INSERT INTO user (user_id, password, member_member_id) VALUES
(1, 'temp_password_1', 1),
(2, 'temp_password_2', 2);
`;

console.log('Setting up updated database schema...');

connection.query(setupSQL, (err, results) => {
  if (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  }
  
  console.log('✅ Database schema updated!');
  console.log('✅ New tables created: user, admin');
  console.log('✅ Attendance table updated');
  console.log('✅ Sample data inserted');
  
  connection.end();
});