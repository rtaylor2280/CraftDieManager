import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";
import { fetchUserById } from "@/utils/userVerify";

const sql = neon(process.env.DATABASE_URL);
const SECRET = process.env.JWT_SECRET;
const BASE_URL = process.env.BASE_URL;

export default async function handler(req, res) {
  console.log("API Route Hit: /api/auth/verify");

  const token = req.cookies?.authToken;
  if (!token) {
    console.info("No token provided. Returning unauthenticated response.");
    return res.status(200).json({ authenticated: false, message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, SECRET);

    const user = await fetchUserById(decoded.userId);
    if (!user || !user.active) {
      console.warn("User inactive. Removing token.");
      res.setHeader(
        "Set-Cookie",
        `authToken=; HttpOnly; Path=/; Max-Age=0; Secure; SameSite=Strict`
      );
      return res.status(200).json({ authenticated: false, message: "Access revoked. Please log in again." });
    }

    // Update lastAuthorization timestamp
    try {
      await sql`UPDATE users SET lastAuthorization = NOW() WHERE id = ${decoded.userId}`;
    } catch (err) {
      console.error("Error updating lastAuthorization:", err.message);
    }

    // Extend token expiration by 30 days
    const newToken = jwt.sign(
      {
        userId: decoded.userId,
        role: decoded.role,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
      },
      SECRET,
      { expiresIn: "30d" }
    );
    res.setHeader(
      "Set-Cookie",
      `authToken=${newToken}; HttpOnly; Path=/; Max-Age=2592000; Secure; SameSite=Strict`
    );

    return res.status(200).json({
      authenticated: true,
      userId: decoded.userId,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      role: decoded.role,
    });
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(200).json({ authenticated: false, message: "Invalid or expired token." });
  }
}
