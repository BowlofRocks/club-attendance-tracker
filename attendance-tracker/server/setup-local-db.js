import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  multipleStatements: true
});

// Create database and tables
const setupSQL = `
-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS club_attendance_tracker;
USE club_attendance_tracker;

-- Create tier table
CREATE TABLE IF NOT EXISTS tier (
  tier_id INT PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(50) NOT NULL
);

-- Create pay_status table  
CREATE TABLE IF NOT EXISTS pay_status (
  status_id INT PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(50) NOT NULL
);

-- Create member table
CREATE TABLE IF NOT EXISTS member (
  member_id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  join_date DATE,
  tier_id INT,
  pay_status_id INT,
  FOREIGN KEY (tier_id) REFERENCES tier(tier_id),
  FOREIGN KEY (pay_status_id) REFERENCES pay_status(status_id)
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  member_id INT,
  attendance_date DATE,
  is_present BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (member_id, attendance_date),
  FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE
);

-- Insert tier data
INSERT IGNORE INTO tier (tier_id, type) VALUES
(1, 'Free Trial'),
(2, 'Guild Member');

-- Insert pay status data
INSERT IGNORE INTO pay_status (status_id, type) VALUES
(1, 'Paid'),
(2, 'Pending'),
(3, 'Overdue');

-- Insert sample members
INSERT IGNORE INTO member (member_id, first_name, last_name, email, phone, join_date, tier_id, pay_status_id) VALUES
(1, 'David', 'Bell', 'david.bell@email.com', '555-0101', '2024-01-15', 1, 1),
(2, 'Tanner', 'Larson', 'tanner.larson@email.com', '555-0102', '2024-01-16', 2, 1),
(5, 'Nicholas', 'Black', 'nicholas.black@email.com', '555-0105', '2024-01-17', 2, 1),
(6, 'Alana', 'Black', 'alana.black@email.com', '555-0106', '2024-01-18', 1, 1),
(7, 'Evan', 'Meacham', 'evan.meacham@email.com', '555-0107', '2024-01-19', 2, 2),
(8, 'Tylor', 'Chatterley', 'tylor.chatterley@email.com', '555-0108', '2024-01-20', 1, 1),
(9, 'Sarah', 'Thiel', 'sarah.thiel@email.com', '555-0109', '2024-01-21', 2, 1),
(10, 'Joshua', 'Kakuschke', 'joshua.kakuschke@email.com', '555-0110', '2024-01-22', 1, 1),
(11, 'Sean', 'Ramos', 'sean.ramos@email.com', '555-0111', '2024-01-23', 2, 2),
(12, 'Bryan', 'Anderson', 'bryan.anderson@email.com', '555-0112', '2024-01-24', 1, 1),
(13, 'Yavanna', 'Carlos', 'yavanna.carlos@email.com', '555-0113', '2024-01-25', 2, 1),
(14, 'Chandler', 'Ranada', 'chandler.ranada@email.com', '555-0114', '2024-01-26', 1, 3),
(15, 'Becca', 'Olsen', 'becca.olsen@email.com', '555-0115', '2024-01-27', 2, 1),
(16, 'Anthony', 'Olsen', 'anthony.olsen@email.com', '555-0116', '2024-01-28', 1, 1),
(17, 'Ryan (Blake)', 'Purser', 'ryan.purser@email.com', '555-0117', '2024-01-29', 2, 2),
(18, 'Luke', 'Levitt', 'luke.levitt@email.com', '555-0118', '2024-01-30', 1, 1),
(19, 'Foryst', 'Van Dyke', 'foryst.vandyke@email.com', '555-0119', '2024-01-31', 2, 1),
(20, 'Jacob', 'Brookhart', 'jacob.brookhart@email.com', '555-0120', '2024-02-01', 1, 1),
(21, 'Jackson', 'Brookhart', 'jackson.brookhart@email.com', '555-0121', '2024-02-02', 2, 1);
`;

console.log('Setting up local database...');

connection.query(setupSQL, (err, results) => {
  if (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  }
  
  console.log('✅ Database setup complete!');
  console.log('✅ Tables created');
  console.log('✅ Sample data inserted');
  
  connection.end();
});