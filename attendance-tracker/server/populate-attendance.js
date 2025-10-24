import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

console.log('Populating attendance table with existing members...');

// First, let's create attendance records for today for all members who don't have one
const populateAttendanceForToday = () => {
  const today = new Date().toISOString().split('T')[0];
  
  const query = `
    INSERT IGNORE INTO attendance (member_id, attendance_date, attendance_time, attendance_member_id)
    SELECT member_id, ?, '00:00', member_id
    FROM member
  `;
  
  connection.query(query, [today], (err, result) => {
    if (err) {
      console.error('Error populating attendance:', err);
      return;
    }
    
    console.log(`✅ Added attendance records for ${result.affectedRows} members for today (${today})`);
    
    // Now let's also populate for the last 30 days to give some sample data
    populateLastThirtyDays();
  });
};

// Function to populate attendance for the last 30 days (optional - for sample data)
const populateLastThirtyDays = () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const dates = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  // Get all member IDs first
  connection.query('SELECT member_id FROM member', (err, members) => {
    if (err) {
      console.error('Error fetching members:', err);
      return;
    }
    
    let insertCount = 0;
    const totalInserts = dates.length * members.length;
    
    dates.forEach(date => {
      members.forEach(member => {
        // Insert with 70% probability (to simulate realistic attendance)
        if (Math.random() > 0.3) {
          const query = `
            INSERT IGNORE INTO attendance (member_id, attendance_date, attendance_time, attendance_member_id)
            VALUES (?, ?, '00:00', ?)
          `;
          
          connection.query(query, [member.member_id, date, member.member_id], (err) => {
            insertCount++;
            if (err && err.code !== 'ER_DUP_ENTRY') {
              console.error('Error inserting attendance:', err);
            }
            
            // Check if this was the last insert
            if (insertCount === totalInserts) {
              console.log(`✅ Populated sample attendance data for the last 30 days`);
              
              // Show summary
              showSummary();
            }
          });
        } else {
          insertCount++;
          if (insertCount === totalInserts) {
            console.log(`✅ Populated sample attendance data for the last 30 days`);
            showSummary();
          }
        }
      });
    });
  });
};

// Show summary of attendance data
const showSummary = () => {
  const query = `
    SELECT 
      COUNT(DISTINCT member_id) as total_members,
      COUNT(*) as total_attendance_records,
      COUNT(DISTINCT attendance_date) as unique_dates
    FROM attendance
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error getting summary:', err);
      return;
    }
    
    const summary = results[0];
    console.log('\n📊 Attendance Table Summary:');
    console.log(`   Members with attendance records: ${summary.total_members}`);
    console.log(`   Total attendance records: ${summary.total_attendance_records}`);
    console.log(`   Unique dates: ${summary.unique_dates}`);
    console.log('\n✅ Attendance population complete!');
    
    connection.end();
  });
};

// Start the population
connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  
  console.log('Connected to database successfully!');
  populateAttendanceForToday();
});