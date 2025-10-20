import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing database connection...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
  
  console.log('✅ Connected to the database successfully!');
  
  // Test query to get members
  connection.query('SELECT * FROM member LIMIT 5', (err, results) => {
    if (err) {
      console.error('❌ Query failed:', err);
    } else {
      console.log('✅ Query successful! Found', results.length, 'members:');
      console.log(results);
    }
    
    connection.end();
  });
});