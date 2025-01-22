import jwt from "jsonwebtoken";
import { verifyUser } from "@/utils/userVerify";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  console.log("API Route Hit: /api/auth/login");

  if (req.method === "POST") {
    try {
      const { username, password, rememberMe } = req.body;

      // Verify user credentials
      console.log("Verifying user credentials...");
      const user = await verifyUser(username, password);

      if (!user) {
        console.warn(`Invalid credentials for username: ${username}`);
        return res.status(401).json({ error: "Invalid username or password." });
      }

      // Check if it's the user's first time logging in
      if (user.firstTimeLogin) {
        console.log(`User ${username} is logging in for the first time.`);

        const resetToken = jwt.sign(
          { userId: user.id, firstTimeLogin: true },
          SECRET,
          { expiresIn: "1h" }
        );
        const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

        try {
          await sql`
            UPDATE users
            SET reset_token = ${resetToken}, reset_token_expires = ${tokenExpiry}
            WHERE id = ${user.id}
          `;
        } catch (dbError) {
          console.error("Error updating database for first-time login:", dbError);
          return res.status(500).json({
            error: "Internal server error while processing first-time login.",
          });
        }

        return res.status(403).json({
          error: "Password reset required. Please reset your password.",
          firstTimeLogin: true,
          resetToken: resetToken,
        });
      }

      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        SECRET,
        { expiresIn: "30d" }
      );

      const cookieOptions = [
        `authToken=${token}`,
        "HttpOnly",
        "Path=/",
        rememberMe ? "Max-Age=2592000" : "",
        "Secure",
        "SameSite=Strict",
      ].filter(Boolean);

      res.setHeader("Set-Cookie", cookieOptions.join("; "));

      return res.status(200).json({ message: "Login successful." });
    } catch (err) {
      console.error("Error during login process:", err.message);
      return res
        .status(500)
        .json({ error: "Internal server error. Please try again later." });
    }
  }

  console.warn(`Unsupported method: ${req.method}`);
  return res.status(405).json({ error: "Method not allowed." });
}
