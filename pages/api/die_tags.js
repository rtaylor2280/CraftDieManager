
import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM die_tags`;
      res.status(200).json(rows);
    } else if (req.method === "POST") {
      const { die_id, tag_id } = req.body;
      await sql`INSERT INTO die_tags (die_id, tag_id) VALUES (${die_id}, ${tag_id})`;
      res.status(201).json({ message: "Die tag added successfully" });
    } else if (req.method === "PUT") {
      const { id, die_id, tag_id } = req.body;
      await sql`UPDATE die_tags SET die_id = ${die_id}, tag_id = ${tag_id} WHERE id = ${id}`;
      res.status(200).json({ message: "Die tag updated successfully" });
    } else if (req.method === "DELETE") {
      const { id } = req.body;
      await sql`DELETE FROM die_tags WHERE id = ${id}`;
      res.status(200).json({ message: "Die tag deleted successfully" });
    } else {
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: "Database query failed" });
  }
}
