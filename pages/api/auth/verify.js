import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless"; // Import neon for database interaction
import { fetchUserById } from "@/utils/userVerify";

const sql = neon(process.env.DATABASE_URL); // Initialize sql instance
const SECRET = process.env.JWT_SECRET;
const BASE_URL = process.env.BASE_URL; // Use the dynamic BASE_URL

export default async function handler(req, res) {
  console.log("API Route Hit: /api/auth/verify");

  const token = req.cookies?.authToken;
  if (!token) {
    console.warn("No token provided in /api/verify. User likely unauthenticated.");
    return res.status(401).json({ error: "Unauthorized: No token provided." });
  }

  try {
    const decoded = jwt.verify(token, SECRET);

    // Fetch user from the database
    const user = await fetchUserById(decoded.userId);
    if (!user || !user.active) {
      console.warn("User inactive. Removing token.");
      res.setHeader(
        "Set-Cookie",
        `authToken=; HttpOnly; Path=/; Max-Age=0; Secure; SameSite=Strict`
      );
      return res.status(403).json({ error: "Access revoked. Please log in again." });
    }

    console.log("Token Decoded:", decoded);

    // Update lastAuthorization timestamp
    try {
      await sql`UPDATE users SET lastAuthorization = NOW() WHERE id = ${decoded.userId}`;
      console.log("Last authorization timestamp updated successfully.");
    } catch (err) {
      console.error("Error updating lastAuthorization:", err.message);
    } 

    // Send email using the send-email route
    try {
      const emailResponse = await fetch(`${BASE_URL}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "craftdiemanager@gmail.com",
          subject: `Login Report - ${user.username}`,
          body: `The user "${user.username}" logged in at ${new Date().toLocaleString()}.`,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Failed to send email via send-email route:", await emailResponse.text());
      } else {
        console.log("Login email sent successfully.");
      }
    } catch (error) {
      console.error("Error calling send-email route:", error.message);
    }

    // Extend token expiration by 30 days
    const newToken = jwt.sign({ userId: decoded.userId, role: decoded.role }, SECRET, { expiresIn: "30d" });
    res.setHeader(
      "Set-Cookie",
      `authToken=${newToken}; HttpOnly; Path=/; Max-Age=2592000; Secure; SameSite=Strict`
    );

    return res.status(200).json({ userId: decoded.userId, role: decoded.role });
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token." });
  }
}
