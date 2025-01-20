// userVerify.js
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL);

/**
 * Verify a user's credentials.
 * @param {string} username - The username to verify.
 * @param {string} password - The plaintext password to verify.
 * @returns {object|null} User object if valid, null otherwise.
 */
export async function verifyUser(username, password) {
  try {
    // Fetch user from database
    const user = await sql`SELECT * FROM users WHERE username = ${username} LIMIT 1`;

    if (user.length === 0) {
      console.warn(`User not found: ${username}`);
      return null; // No such user
    }

    // Verify password hash
    const isMatch = await bcrypt.compare(password, user[0].password_hash);
    if (!isMatch) {
      console.warn(`Invalid credentials for user: ${username}`);
      return null; // Invalid password
    }

    // Return the user object (without sensitive data)
    return {
      id: user[0].id,
      username: user[0].username,
      role: user[0].role,
      firstName: user[0].first_name,
      lastName: user[0].last_name,
      active: user[0].active, // Include 'active' if needed
      firstTimeLogin: user[0].first_time_login, // Include 'first_time_login'
    };
  } catch (err) {
    console.error("Error verifying user:", err.message);
    throw new Error("Internal server error");
  }
}

/**
 * Fetch a user by ID from the database.
 * @param {number} userId - The ID of the user to fetch.
 * @returns {object|null} User object if found, null otherwise.
 */
export async function fetchUserById(userId) {
  try {
    // Fetch user from database
    const users = await sql`SELECT id, username, role, active FROM users WHERE id = ${userId} LIMIT 1`;

    if (users.length === 0) {
      console.warn(`User not found for ID: ${userId}`);
      return null; // No such user
    }

    return users[0]; // Return the user object
  } catch (err) {
    console.error("Error fetching user by ID:", err.message);
    throw new Error("Internal server error");
  }
}
