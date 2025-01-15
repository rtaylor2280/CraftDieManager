import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  console.log("API Route Hit: /api/verify");

  const token = req.cookies?.authToken; // Ensure cookies are parsed
  console.log("Extracted Token:", token);

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    console.log("Token Decoded:", decoded);

    // Send back user information
    return res.status(200).json({ userId: decoded.userId, role: decoded.role });
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
