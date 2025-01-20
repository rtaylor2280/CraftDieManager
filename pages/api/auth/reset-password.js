import { neon } from "@neondatabase/serverless";
import bcrypt from "bcrypt";

const sql = neon(process.env.DATABASE_URL); // Initialize Neon SQL client

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      console.log("Missing token or newPassword in request body.");
      return res.status(400).json({ error: "Token and new password are required" });
    }

    try {
      console.log("Received token for password reset:", token);

      const user = await sql`
        SELECT reset_token, reset_token_expires, NOW() AS current_time
        FROM users
        WHERE reset_token = ${token}
      `;

      if (user.length === 0) {
        console.error("Invalid or expired token. Token:", token);
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      const { reset_token_expires } = user[0];
      console.log("DB Expiry Time:", reset_token_expires);
      console.log("Current Time:", new Date());

      // Ensure the token is not expired
      if (new Date(reset_token_expires) <= new Date()) {
        console.error("Token is expired.");
        return res.status(400).json({ error: "Token has expired" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password and clear the reset token
      await sql`
        UPDATE users
        SET password_hash = ${hashedPassword},
            reset_token = NULL,
            reset_token_expires = NULL
        WHERE reset_token = ${token}
      `;

      console.log("Password reset successfully for token:", token);
      return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Error in /api/auth/reset-password:", error);
      return res.status(500).json({ error: "An unexpected error occurred" });
    }
  } else if (req.method === "GET") {
    const token = req.query.token;

    if (!token) {
      console.log("No token provided in request query.");
      return res.status(400).json({ error: "Token is required" });
    }

    try {
      console.log("Validating token:", token);

      const user = await sql`
        SELECT reset_token_expires, NOW() AS current_time
        FROM users
        WHERE reset_token = ${token}
      `;

      if (user.length === 0) {
        console.warn("Invalid token provided:", token);
        return res.status(404).json({ valid: false, error: "Invalid token" });
      }

      const { reset_token_expires } = user[0];
      console.log("DB Expiry Time:", reset_token_expires);

      // Check token expiration
      if (new Date(reset_token_expires) <= new Date()) {
        console.warn("Token has expired:", token);
        return res.status(400).json({ valid: false, error: "Token expired" });
      }

      console.log("Token is valid:", token);
      return res.status(200).json({ valid: true });
    } catch (error) {
      console.error("Error validating token:", error);
      return res.status(500).json({ error: "An unexpected error occurred" });
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
