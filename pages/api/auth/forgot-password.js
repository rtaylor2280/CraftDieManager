import { neon } from "@neondatabase/serverless";
import { v4 as uuidv4 } from "uuid";
import validator from "validator";
import rateLimit from "express-rate-limit";

const sql = neon(process.env.DATABASE_URL);
const BASE_URL = process.env.BASE_URL.startsWith("http://")
  ? process.env.BASE_URL.replace("http://", "https://")
  : process.env.BASE_URL;

const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per IP
  message: {
    error: "Too many password reset requests. Try again later.",
  },
});

function getEmailBody(resetLink) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f9f9f9;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          a.button {
            display: inline-block;
            padding: 10px 20px;
            color: white;
            background: #007BFF;
            text-decoration: none;
            border-radius: 4px;
          }
          a.button:hover {
            background: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Password Reset</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" class="button">Reset Password</a>
          <p><small>This link will expire in 1 hour.</small></p>
        </div>
      </body>
    </html>
  `;
}

export default async function handler(req, res) {
  await limiter(req, res, async () => {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { email } = req.body;
    const genericResponse = {
      message: "If this email is registered, a reset link has been sent.",
    };

    if (!email || !validator.isEmail(email)) {
      console.warn("Invalid email provided:", email);
      return res.status(400).json({ error: "Valid email is required." });
    }

    try {
      const user = await sql`SELECT * FROM users WHERE email = ${email}`;
      if (user.length > 0) {
        console.log("User found:", email);

        const resetToken = uuidv4();
        const tokenExpiry = new Date(Date.now() + ONE_HOUR);

        await sql`
          UPDATE users
          SET reset_token = ${resetToken}, reset_token_expires = ${tokenExpiry}
          WHERE email = ${email}
        `;
        console.log("Token saved for user:", email);

        const resetLink = `${BASE_URL}/reset-password?token=${resetToken}`;
        const emailResponse = await fetch(`${BASE_URL}/api/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            subject: "Password Reset Request",
            body: getEmailBody(resetLink),
          }),
        });

        if (!emailResponse.ok) {
          console.error("Email sending failed:", await emailResponse.text());
        } else {
          console.log("Reset email sent successfully to:", email);
        }
      }

      return res.status(200).json(genericResponse);
    } catch (error) {
      console.error("Error processing password reset:", error);
      return res.status(500).json(genericResponse);
    }
  });
}
