import jwt from "jsonwebtoken";
import { verifyUser } from "@/utils/userVerify";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL); // Initialize Neon SQL client
const SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  console.log("API Route Hit: /api/auth/login");

  if (req.method === "POST") {
    try {
      const { username, password, rememberMe } = req.body;
      console.log("Request Body:", { username, password, rememberMe });

      // Verify user credentials
      console.log("Verifying user credentials...");
      const user = await verifyUser(username, password);
      console.log("User Verified:", user);

      if (!user) {
        console.warn(`Invalid credentials for username: ${username}`);
        return res.status(401).json({ error: "Invalid username or password." });
      }

      // Check if it's the user's first time logging in
      if (user.firstTimeLogin) {
        console.log(`User ${username} is logging in for the first time.`);

        // Generate a temporary token for first-time login password reset
        const resetToken = jwt.sign(
          { userId: user.id, firstTimeLogin: true },
          SECRET,
          { expiresIn: "1h" } // 1-hour expiration
        );
        const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Update the database with the temporary token and expiration
        try {
          console.log("Updating database with first-time login token...");
          await sql`
            UPDATE users
            SET reset_token = ${resetToken}, reset_token_expires = ${tokenExpiry}
            WHERE id = ${user.id}
          `;
          console.log("Database updated with reset token for first-time login.");
        } catch (dbError) {
          console.error("Error updating database for first-time login:", dbError);
          return res.status(500).json({
            error: "Internal server error while processing first-time login.",
          });
        }

        console.log("Redirecting to reset-password with token...");
        return res.status(403).json({
          error: "Password reset required. Please reset your password.",
          firstTimeLogin: true,
          resetToken: resetToken, // Include reset token in the response
        });
      }

      // Generate JWT token for normal login
      console.log(`Generating JWT token for user: ${username}`);
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

      console.log(`Setting authentication cookie for user: ${username}`);
      res.setHeader("Set-Cookie", cookieOptions.join("; "));

      console.log(
        `Cookie Set: ${
          rememberMe ? "Persistent (30 days)" : "Session-only"
        }`
      );

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
