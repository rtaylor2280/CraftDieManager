
import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM tags`;
      res.status(200).json(rows);
    } else if (req.method === "POST") {
      const { name } = req.body;
      await sql`INSERT INTO tags (name) VALUES (${name})`;
      res.status(201).json({ message: "Tag added successfully" });
    } else if (req.method === "PUT") {
      const { id, name } = req.body;
      await sql`UPDATE tags SET name = ${name} WHERE id = ${id}`;
      res.status(200).json({ message: "Tag updated successfully" });
    } else if (req.method === "DELETE") {
      const { id } = req.body;
      await sql`DELETE FROM tags WHERE id = ${id}`;
      res.status(200).json({ message: "Tag deleted successfully" });
    } else {
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: "Database query failed" });
  }
}
