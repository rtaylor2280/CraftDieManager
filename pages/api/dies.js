
import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM dies`;
      res.status(200).json(rows);
    } else if (req.method === "POST") {
      const { name, material } = req.body;
      await sql`INSERT INTO dies (name, material) VALUES (${name}, ${material})`;
      res.status(201).json({ message: "Die added successfully" });
    } else if (req.method === "PUT") {
      const { id, name, material } = req.body;
      await sql`UPDATE dies SET name = ${name}, material = ${material} WHERE id = ${id}`;
      res.status(200).json({ message: "Die updated successfully" });
    } else if (req.method === "DELETE") {
      const { id } = req.body;
      await sql`DELETE FROM dies WHERE id = ${id}`;
      res.status(200).json({ message: "Die deleted successfully" });
    } else {
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: "Database query failed" });
  }
}
