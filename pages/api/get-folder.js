import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { folder } = req.body; // Accepts folder string or folder ID

  // Resolve folder ID based on folder string or default to root
  const folderId =
    folder === "DIES"
      ? process.env.GOOGLE_DRIVE_DIES_FOLDER_ID
      : folder === "LOCATIONS"
      ? process.env.GOOGLE_DRIVE_LOCATIONS_FOLDER_ID
      : folder || null; // Use folder ID if provided, else null (root)

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    const files = [];
    let pageToken = null;

    do {
      const response = await drive.files.list({
        q: folderId
          ? `'${folderId}' in parents and trashed = false` // Files in specified folder
          : `trashed = false`, // Root directory (default)
        fields: "nextPageToken, files(id, name, mimeType)",
        pageSize: 1000,
        pageToken,
      });

      files.push(...response.data.files);
      pageToken = response.data.nextPageToken;
    } while (pageToken); // Continue fetching if there are more files

    res.status(200).json({ files });
  } catch (error) {
    console.error("Error fetching folder files:", error.message);
    res.status(500).json({ error: "Failed to fetch folder files." });
  }
}
