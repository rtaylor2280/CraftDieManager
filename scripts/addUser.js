require("dotenv").config(); // Load environment variables from .env
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createUser(username, plainPassword, role = "user") {
  const bcrypt = require("bcryptjs");
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

  try {
    await pool.query(
      "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)",
      [username, passwordHash, role]
    );
    console.log(`User ${username} added successfully!`);
  } catch (err) {
    console.error("Error adding user:", err.message);
  } finally {
    pool.end();
  }
}

// Add your admin user
createUser("admin", "your_secure_password", "admin");
