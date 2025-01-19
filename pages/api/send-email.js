import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const email = `
      From: "Craft Die Manager" <craftdiemanager@gmail.com>
      To: ${to}
      Subject: ${subject}
      Content-Type: text/html; charset=UTF-8
      Content-Transfer-Encoding: 7bit
      ${body}
      `;

      const encodedEmail = Buffer.from(email)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const result = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedEmail,
        },
      });

      return res.status(200).json({ message: 'Email sent successfully', result });
    } catch (error) {
      console.error('Failed to send email:', error.response?.data || error.message);
      return res.status(500).json({ error: 'Failed to send email', details: error.response?.data || error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


/********************Example************************/
/*
    // Send email using the send-email route
    try {
      const emailResponse = await fetch(`${BASE_URL}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "craftdiemanager@gmail.com",
          subject: `Login Report - ${user.username}`,
          body: `The user "${user.username}" logged in at ${new Date().toLocaleString()}.`,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Failed to send email via send-email route:", await emailResponse.text());
      } else {
        console.log("Login email sent successfully.");
      }
    } catch (error) {
      console.error("Error calling send-email route:", error.message);
    }
/****************************************************/
