import jwt from "jsonwebtoken";
import { verifyUser } from "@/utils/userVerify";

const SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  console.log("API Route Hit: /api/login");

  if (req.method === "POST") {
    try {
      const { username, password } = req.body;
      console.log("Request Body:", { username, password });

      // Verify user credentials
      const user = await verifyUser(username, password);
      console.log("User Verified:", user);

      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, role: user.role }, SECRET, { expiresIn: "30d" });
      console.log("Generated Token:", token);

      // Set the cookie with the token
      res.setHeader(
        "Set-Cookie",
        `authToken=${token}; HttpOnly; Path=/; Max-Age=2592000; Secure; SameSite=Strict`
      );

      return res.status(200).json({ message: "Login successful" });
    } catch (err) {
      console.error("Error during login:", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
