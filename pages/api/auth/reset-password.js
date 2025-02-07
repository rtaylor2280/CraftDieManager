import { neon } from "@neondatabase/serverless";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const sql = neon(process.env.DATABASE_URL);
const SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { token, newPassword, rememberMe } = req.body;

    if (!token || !newPassword) {
      console.log("Missing token or newPassword in request body.");
      return res.status(400).json({ error: "Token and new password are required" });
    }

    try {
      const user = await sql`
        SELECT id, reset_token, reset_token_expires, first_name, last_name, username, role, first_time_login, password_hash, NOW() AS current_time
        FROM users
        WHERE reset_token = ${token}
      `;

      if (user.length === 0) {
        console.error("Invalid or expired token.");
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      const {
        id,
        reset_token_expires,
        first_name,
        last_name,
        username,
        role,
        first_time_login,
        password_hash,
      } = user[0];

      if (new Date(reset_token_expires) <= new Date()) {
        console.error("Token is expired.");
        return res.status(400).json({ error: "Token has expired" });
      }

      const isSamePassword = await bcrypt.compare(newPassword, password_hash);

      if (isSamePassword && first_time_login) {
        console.error("New password cannot be the same as the current password for first-time login.");
        return res.status(400).json({ error: "New password cannot be the same as your current password." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await sql`
        UPDATE users
        SET password_hash = ${hashedPassword},
            reset_token = NULL,
            reset_token_expires = NULL,
            first_time_login = false
        WHERE id = ${id}
      `;

      const newToken = jwt.sign(
        { userId: id, role, firstName: first_name, lastName: last_name },
        SECRET,
        { expiresIn: "30d" }
      );

      const cookieOptions = [
        `authToken=${newToken}`,
        "HttpOnly",
        "Path=/",
        rememberMe ? "Max-Age=2592000" : "",
        "Secure",
        "SameSite=Strict",
      ].filter(Boolean);

      res.setHeader("Set-Cookie", cookieOptions.join("; "));

      return res.status(200).json({
        message: "Password updated successfully.",
        firstName: first_name,
        lastName: last_name,
        username,
      });
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
      const user = await sql`
        SELECT reset_token_expires, NOW() AS current_time
        FROM users
        WHERE reset_token = ${token}
      `;

      if (user.length === 0) {
        console.warn("Invalid token provided.");
        return res.status(404).json({ valid: false, error: "Invalid token" });
      }

      const { reset_token_expires } = user[0];

      if (new Date(reset_token_expires) <= new Date()) {
        console.warn("Token has expired.");
        return res.status(400).json({ valid: false, error: "Token expired" });
      }

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
