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

  const { fileIds } = req.body;

  if (!fileIds || (Array.isArray(fileIds) && fileIds.length === 0)) {
    return res.status(400).json({ error: "No file IDs provided" });
  }

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    const ids = Array.isArray(fileIds) ? fileIds : [fileIds];
    const fileRequests = ids.map(async (fileId) => {
      try {
        const fileMetadata = await drive.files.get({
          fileId,
          fields: "id, name, mimeType",
        });

        const fileStream = await drive.files.get(
          { fileId, alt: "media" },
          { responseType: "stream" }
        );

        const chunks = [];
        fileStream.data.on("data", (chunk) => chunks.push(chunk));
        await new Promise((resolve, reject) => {
          fileStream.data.on("end", resolve);
          fileStream.data.on("error", reject);
        });

        return {
          id: fileId,
          name: fileMetadata.data.name,
          mimeType: fileMetadata.data.mimeType,
          data: Buffer.concat(chunks).toString("base64"),
        };
      } catch (error) {
        console.error(`Error fetching file with ID ${fileId}:`, error.message);
        return null; // Return null for failed files
      }
    });

    const files = (await Promise.all(fileRequests)).filter(Boolean); // Exclude null results
    res.status(200).json({ files });
  } catch (error) {
    console.error("Unexpected error in get-files:", error.message);
    res.status(500).json({ error: "Failed to fetch files" });
  }
}
