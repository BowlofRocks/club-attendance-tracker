import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'club_attendance_tracker'
});

console.log('Connecting to database...');

connection.connect((err) => {
  if (err) {
    console.error('Failed to connect:', err);
    process.exit(1);
  }
  
  console.log('✅ Connected to database\n');
  
  // Check what's in the user and member tables
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
    FROM user u
    JOIN member m ON u.member_member_id = m.member_id
    LEFT JOIN admin a ON m.member_id = a.member_id
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      connection.end();
      process.exit(1);
    }
    
    console.log('📋 Users in database:');
    console.log('====================\n');
    
    if (results.length === 0) {
      console.log('❌ No users found in database!\n');
      console.log('Run "npm run setup-db" to create the database and insert sample data.');
    } else {
      results.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.first_name} ${user.last_name}`);
        console.log(`  Password: ${user.password}`);
        console.log(`  Is Admin: ${user.admin_id !== null ? 'Yes' : 'No'}`);
        console.log(`  Role: ${user.role || 'user'}`);
        console.log('');
      });
    }
    
    connection.end();
  });
});
