import { google } from "googleapis";
import multiparty from "multiparty";
import fs from "fs";
import path from "path"; // For handling file extensions

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for multiparty
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ error: "Failed to parse form data" });
    }

    const folder = fields.folder?.[0]; // Expect "DIES", "LOCATIONS", or null
    const prefix = fields.prefix?.[0] || null; // Optional prefix
    const startIndex = parseInt(fields.startIndex?.[0] || "1", 10); // Optional starting index

    // Resolve folder ID based on folder string or use the default directory (root)
    const folderId =
      folder === "DIES"
        ? process.env.GOOGLE_DRIVE_DIES_FOLDER_ID
        : folder === "LOCATIONS"
        ? process.env.GOOGLE_DRIVE_LOCATIONS_FOLDER_ID
        : null;

    if (!folder || (folder !== "DIES" && folder !== "LOCATIONS")) {
      console.warn(
        `Invalid folder type "${folder}" received. Using default root directory.`
      );
    }

    if (!files || !files.files) {
      console.error("No files uploaded");
      return res.status(400).json({ error: "No files uploaded" });
    }

    try {
      const drive = google.drive({ version: "v3", auth: oauth2Client });
      const fileIds = []; // To store file IDs for each uploaded file

      for (let i = 0; i < files.files.length; i++) {
        const uploadedFile = files.files[i];
        const originalExtension = path.extname(uploadedFile.originalFilename); // Get file extension
        const fileName = prefix
          ? `${prefix}-${startIndex + i}${originalExtension}` // Add prefix and index
          : uploadedFile.originalFilename; // Default to original name

        const fileMetadata = {
          name: fileName,
          parents: folderId ? [folderId] : [], // Use resolved folder ID or root
        };

        console.log(`Uploading file to folder`);

        const result = await drive.files.create({
          resource: fileMetadata,
          media: {
            mimeType: uploadedFile.headers["content-type"],
            body: fs.createReadStream(uploadedFile.path),
          },
          fields: "id",
        });

        // Clean up temporary file
        try {
          fs.unlinkSync(uploadedFile.path);
          console.log(`Temporary file cleanup successful`);
        } catch (err) {
          console.error("Error deleting temporary file:", err);
        }

        // Store the file ID
        fileIds.push(result.data.id);
      }

      return res.status(200).json({
        message: "Files uploaded successfully",
        fileIds, // Return only file IDs
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      return res.status(500).json({ error: "Failed to upload files" });
    }
  });
}
