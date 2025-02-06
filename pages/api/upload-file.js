import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
import formidable from "formidable";
import fs from "fs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Wasabi S3 Client Configuration
const s3Client = new S3Client({
    region: process.env.WASABI_REGION,
    endpoint: `https://s3.${process.env.WASABI_REGION}.wasabisys.com`,
    credentials: {
        accessKeyId: process.env.WASABI_ACCESS_KEY,
        secretAccessKey: process.env.WASABI_SECRET_KEY
    }
});

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Allow multiple files
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(400).json({ error: "File upload failed" });

        const entityType = fields.entity_type?.[0];
        const entityId = fields.entity_id?.[0] || null;
        const relationshipType = fields.relationship_type?.[0] || "general";
        const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file]; // Handle single or multiple files

        if (!entityType || uploadedFiles.length === 0) {
            return res.status(400).json({ error: "Missing entity_type or file" });
        }

        // Determine folder (e.g., Dev/Dies or Prod/Locations)
        const envFolder = process.env.WASABI_ENV_FOLDER || "Dev";

        try {
            const uploadedFileRecords = [];

            // Loop through uploaded files (single or multiple)
            for (const file of uploadedFiles) {
                const Key = `${envFolder}/${entityType}/${file.originalFilename}`;

                // Use Upload from @aws-sdk/lib-storage to handle Wasabi redirects
                const upload = new Upload({
                    client: s3Client,
                    params: {
                        Bucket: process.env.WASABI_BUCKET,
                        Key,
                        Body: fs.createReadStream(file.filepath),
                        ACL: "private",
                        ContentType: file.mimetype
                    }
                });

                await upload.done(); // Wait for the file to finish uploading

                // Insert file record into the database
                const [fileRecord] = await sql`
                    INSERT INTO files (filename, wasabi_key, content_type)
                    VALUES (${file.originalFilename}, ${Key}, ${file.mimetype})
                    RETURNING id;
                `;

                // If entityId exists, create a relationship in the correct table
                if (entityId) {
                    const tableName = entityType.toLowerCase().replace(/s$/, "") + "_files"; // e.g., "die_files"

                    // Check if table exists before inserting
                    const [tableCheck] = await sql`
                        SELECT to_regclass(${tableName}) as table_exists;
                    `;

                    if (tableCheck.table_exists) {
                        await sql`
                            INSERT INTO ${sql(tableName)} (die_id, file_id, relationship_type)
                            VALUES (${entityId}, ${fileRecord.id}, ${relationshipType});
                        `;
                    }
                }

                uploadedFileRecords.push({
                    fileId: fileRecord.id,
                    fileName: file.originalFilename
                });
            }

            res.status(200).json({ message: "Files uploaded successfully", uploadedFiles: uploadedFileRecords });
        } catch (error) {
            console.error("Upload error:", error);
            res.status(500).json({ error: "Upload failed" });
        }
    });
}
