import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

export default async function handler(req, res) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const message = [
      'From: "Your App" <craftdiemanager@gmail.com>',
      'To: recipient@example.com',
      'Subject: Test Email from Craft Die Manager',
      '',
      'This is a test email sent from the Gmail API!',
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    res.status(200).json({ message: 'Email sent successfully', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
