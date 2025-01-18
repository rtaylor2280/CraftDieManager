import { google } from 'googleapis';
import fs from 'fs';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

export default async function handler(req, res) {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  try {
    const fileMetadata = {
      name: 'test-file.txt',
    };
    const media = {
      mimeType: 'text/plain',
      body: fs.createReadStream('path/to/test-file.txt'),
    };

    const result = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    res.status(200).json({ message: 'File uploaded successfully', fileId: result.data.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
