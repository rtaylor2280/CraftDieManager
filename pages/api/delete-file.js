import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";
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

export default async function handler(req, res) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { fileId } = req.body;

    if (!fileId) {
        return res.status(400).json({ error: "Missing fileId" });
    }

    try {
        // Get file details from database
        const [fileRecord] = await sql`SELECT wasabi_key FROM files WHERE id = ${fileId}`;

        if (!fileRecord) {
            return res.status(404).json({ error: "File not found" });
        }

        const wasabiKey = fileRecord.wasabi_key;

        // Delete file from Wasabi
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.WASABI_BUCKET,
            Key: wasabiKey
        });

        await s3Client.send(deleteCommand);

        // Delete file record from database
        await sql`DELETE FROM files WHERE id = ${fileId}`;

        // Remove relationships (ONLY if the table exists)
        const tables = ["die_files", "location_files", "project_files"];
        for (const table of tables) {
            try {
                const [tableCheck] = await sql`
                    SELECT to_regclass(${table}) AS table_exists;
                `;
                if (tableCheck.table_exists) {
                    await sql`DELETE FROM ${sql(table)} WHERE file_id = ${fileId}`;
                }
            } catch (err) {
                console.warn(`Skipping deletion from ${table}: Table does not exist.`);
            }
        }

        res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
        console.error("File deletion error:", error);
        res.status(500).json({ error: "Failed to delete file, but it may have been removed." });
    }
}
