import { neon } from "@neondatabase/serverless";
import { v4 as uuidv4 } from "uuid";

const sql = neon(process.env.DATABASE_URL); // Initialize the Neon SQL client

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email } = req.body;

    // Generic response to avoid exposing email existence
    const genericResponse = {
      message: "If this email is registered, we have sent a reset link. Please check your inbox and spam folder.",
    };

    if (!email) {
      console.warn("Forgot-password: No email provided in request.");
      return res.status(400).json({ error: "Valid email is required" });
    }

    try {
      console.log(`Forgot-password: Processing reset request for ${email}`);

      // Check if the user exists
      const user = await sql`SELECT * FROM users WHERE email = ${email}`;

      if (user.length > 0) {
        // Generate reset token and expiry
        const resetToken = uuidv4();
        const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        console.log(`Forgot-password: tokenExpiry will be recorded as ${tokenExpiry}`);

        // Update user record with token
        await sql`
          UPDATE users
          SET reset_token = ${resetToken}, reset_token_expires = ${tokenExpiry}
          WHERE email = ${email}
        `;
        console.log("Forgot-password: Reset token created and saved.");

        // Send reset email
        const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
        const resetLink = `${BASE_URL}/reset-password?token=${resetToken}`;
        const emailBody = getEmailBody(resetLink);

        const emailResponse = await fetch(`${BASE_URL}/api/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            subject: "Password Reset Request",
            body: emailBody,
          }),
        });

        if (!emailResponse.ok) {
          console.error("Forgot-password: Failed to send email.");
        } else {
          console.log("Forgot-password: Reset email sent successfully.");
        }
      } else {
        console.warn("Forgot-password: No user found for the provided email.");
      }

      // Always return the generic response
      return res.status(200).json(genericResponse);
    } catch (error) {
      console.error("Forgot-password: Error during processing:", error);
      return res.status(500).json(genericResponse); // Generic response for server errors
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function getEmailBody(resetLink) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          padding: 20px;
          text-align: center; /* Centers text in the email body */
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          text-align: center; /* Ensures all content inside is centered */
        }
        .email-logo {
          margin-bottom: 20px;
        }
        .email-logo img {
          max-height: 120px; /* Adjust logo size */
          width: auto;
        }
        .btn {
          display: inline-block;
          padding: 10px 20px;
          color: white !important;
          background-color: #007BFF !important;
          text-decoration: none !important;
          border-radius: 5px;
          border: 1px solid #007BFF;
          font-weight: bold;
          margin: 20px auto;
        }
        .btn:hover {
          background-color: #0056b3 !important;
          border-color: #0056b3;
        }
        .footer {
          margin-top: 20px;
          font-size: 0.8em;
          color: #555;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-logo">
          <img
            src="https://res.cloudinary.com/dor8hisms/image/upload/v1737569998/CraftDieManagerLogo_2_utpvtx.png"
            alt="Craft Die Manager Logo"
          />
        </div>
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p>
          <a href="${resetLink}" class="btn">Reset Password</a>
        </p>
        <p>This link will expire in 1 hour.</p>
        <div class="footer">
          <p>If you did not request a password reset, you can ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
