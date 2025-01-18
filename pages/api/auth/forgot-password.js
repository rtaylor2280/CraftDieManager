import { neon } from "@neondatabase/serverless";
import { v4 as uuidv4 } from "uuid";

const sql = neon(process.env.DATABASE_URL); // Initialize the Neon SQL client

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email } = req.body;

    // Generic user-facing response
    const genericResponse = {
      message: "If this email is registered, we have sent a reset link. Please check your inbox and spam folder.",
    };

    if (!email) {
      console.warn("Forgot-password: No email provided in request.");
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      console.log(`Forgot-password: Processing reset for email: ${email}`);

      // Check if the user exists
      const user = await sql`SELECT * FROM users WHERE email = ${email}`;

      if (user.length > 0) {
        console.log(`Forgot-password: User found for email: ${email}`);

        // Generate reset token and expiry
        const resetToken = uuidv4();
        const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Update user record with token
        await sql`
          UPDATE users
          SET reset_token = ${resetToken}, reset_token_expires = ${tokenExpiry}
          WHERE email = ${email}
        `;
        console.log(`Forgot-password: Token generated and saved for email: ${email}`);

        // Send reset email
        const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
        const resetLink = `${BASE_URL}/reset-password?token=${resetToken}`;

        const emailResponse = await fetch(`${BASE_URL}/api/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            subject: "Password Reset Request",
            body: `
              <p>You requested a password reset. Click the link below to reset your password:</p>
              <p><a href="${resetLink}">Reset Password</a></p>
              <p>This link will expire in 1 hour.</p>
            `,
          }),
        });

        if (!emailResponse.ok) {
          console.error("Forgot-password: Failed to send email.", await emailResponse.text());
        } else {
          console.log(`Forgot-password: Reset email sent successfully to ${email}`);
        }
      } else {
        console.warn(`Forgot-password: No user found for email: ${email}`);
      }

      // Always return the same generic response to avoid exposing email existence
      return res.status(200).json(genericResponse);
    } catch (error) {
      console.error("Forgot-password: Error occurred during processing:", error);
      return res.status(500).json(genericResponse); // Generic message for server errors
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
