import { google } from "googleapis";

export default async function handler(req, res) {
  console.log("API Route Hit: /api/send-email");

  if (req.method === "POST") {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      console.error("Missing email fields in the request body.");
      return res.status(400).json({ error: "Missing required email fields" });
    }

    try {
      console.log("Sending email to:", to);

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      const encodedMessage = Buffer.from(
        `To: ${to}\r\nFrom: "CraftDieManager App" <craftdiemanager@gmail.com>\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${body}`
      )
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const response = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
        },
      });

      console.log("Email sent successfully:", response.data);
      return res.status(200).json({ message: "Email sent successfully" });
    } catch (err) {
      console.error("Error sending email:", err.message);
      return res.status(500).json({ error: "Failed to send email" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
