import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'club_attendance_tracker'
});

const createTableSQL = `
  CREATE TABLE IF NOT EXISTS payment_reset (
    reset_id INT PRIMARY KEY AUTO_INCREMENT,
    reset_date DATE NOT NULL,
    notification_dismissed BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

console.log('Creating payment_reset table...');

connection.query(createTableSQL, (err, results) => {
  if (err) {
    console.error('Error creating table:', err);
    process.exit(1);
  }
  
  console.log('✅ payment_reset table created successfully!');
  connection.end();
});
