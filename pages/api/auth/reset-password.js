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
      console.log("Received token:", token);

      const user = await sql`
        SELECT reset_token, reset_token_expires, NOW() AS current_time
        FROM users
        WHERE reset_token = ${token}
      `;

      if (user.length === 0) {
        console.error("Invalid or expired token. Token:", token);
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      console.log("DB Token:", user[0].reset_token);
      console.log("DB Expiry Time:", user[0].reset_token_expires);
      console.log("Current Time:", user[0].current_time);

      // Ensure the token is not expired
      if (new Date(user[0].reset_token_expires) <= new Date()) {
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
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
