import jwt from "jsonwebtoken";
import { verifyUser } from "@/utils/userVerify";

const SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  console.log("API Route Hit: /api/auth/login");

  if (req.method === "POST") {
    try {
      const { username, password, rememberMe } = req.body;
      console.log("Request Body:", { username, password, rememberMe });

      // Verify user credentials
      const user = await verifyUser(username, password);
      console.log("User Verified:", user);

      if (!user) {
        return res.status(401).json({ error: "Invalid username or password." });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, 
          role: user.role, 
          firstName: user.firstName, 
          lastName: user.lastName 

        }, 
        SECRET, 
        { expiresIn: "30d" }
      );
      console.log("Generated Token:", token);

      // Set cookie attributes dynamically
      const cookieOptions = [
        `authToken=${token}`,
        "HttpOnly",
        "Path=/",
        rememberMe ? "Max-Age=2592000" : "", // 30 days for 'remember me', session-only otherwise
        "Secure",
        "SameSite=Strict",
      ].filter(Boolean); // Remove empty attributes

      res.setHeader("Set-Cookie", cookieOptions.join("; "));

      // Log Max-Age determination
      console.log(
        `Cookie Set: ${
          rememberMe ? "Persistent (30 days)" : "Session-only"
        }`
      );

      return res.status(200).json({ message: "Login successful." });
    } catch (err) {
      console.error("Error during login:", err.message);
      return res.status(500).json({ error: "Internal server error. Please try again later." });
    }
  }

  return res.status(405).json({ error: "Method not allowed." });
}
