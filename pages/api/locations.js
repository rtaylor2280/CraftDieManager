
import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM locations`;
      res.status(200).json(rows);
    } else if (req.method === "POST") {
      const { name, description, primary_image, additional_images } = req.body;
      await sql`
        INSERT INTO locations (name, description, primary_image, additional_images)
        VALUES (${name}, ${description}, ${primary_image}, ${additional_images})
      `;
      res.status(201).json({ message: "Location added successfully" });
    } else if (req.method === "PUT") {
      const { id, name, description, primary_image, additional_images } = req.body;
      await sql`
        UPDATE locations
        SET name = ${name}, description = ${description},
            primary_image = ${primary_image}, additional_images = ${additional_images}
        WHERE id = ${id}
      `;
      res.status(200).json({ message: "Location updated successfully" });
    } else if (req.method === "DELETE") {
      const { id } = req.body;
      await sql`DELETE FROM locations WHERE id = ${id}`;
      res.status(200).json({ message: "Location deleted successfully" });
    } else {
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: "Database query failed" });
  }
}
