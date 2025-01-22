import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

const sql = neon(process.env.DATABASE_URL);
const SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  console.log("API Route Hit: /api/auth/initiate-password-reset");

  let userId;

  if (req.method === "POST") {
    userId = req.body.userId;

    if (!userId) {
      console.error("User ID not provided in the request.");
      return res.status(400).json({ error: "User ID is required." });
    }

    console.log("User ID received:", userId);
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const resetToken = jwt.sign({ userId }, SECRET, { expiresIn: "1h" });
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await sql`
      UPDATE users
      SET reset_token = ${resetToken}, reset_token_expires = ${tokenExpiry}
      WHERE id = ${userId}
    `;

    console.log(`Generated reset token for user ${userId}.`);
    return res.status(200).json({
      message: "Reset token generated.",
      token: resetToken,
    });
  } catch (error) {
    console.error("Error generating reset token:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
}
