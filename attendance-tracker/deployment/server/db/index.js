import mysql from "mysql2";

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "premium323.web-hosting.com",
  user: process.env.DB_USER || "rexhfyti_bowlofrocks",
  password: process.env.DB_PASS || "uUEp4pJ8iyuXbRT",
  database: process.env.DB_NAME || "rexhfyti_club_tracker",
});

connection.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
    return;
  }
  console.log("Connected to the MySQL database");
});

export default connection;
