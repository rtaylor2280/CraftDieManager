import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM die_tags`;
      res.status(200).json(rows);
    } else if (req.method === "POST") {
      const { die_id, tag_ids } = req.body; // tag_ids is an array

      if (!die_id || !tag_ids || !tag_ids.length) {
        return res
          .status(400)
          .json({ error: "Die ID and tag IDs are required." });
      }

      try {
        const values = tag_ids
          .map((tag_id) => `(${die_id}, ${tag_id})`)
          .join(", ");
        await sql`INSERT INTO die_tags (die_id, tag_id) VALUES ${sql.raw(
          values
        )}`;
        res.status(201).json({ message: "Tags added successfully" });
      } catch (error) {
        console.error("Database query failed:", error);
        res.status(500).json({ error: "Failed to add tags." });
      }
    } else if (req.method === "PUT") {
      const { id, die_id, tag_id } = req.body;
      await sql`UPDATE die_tags SET die_id = ${die_id}, tag_id = ${tag_id} WHERE id = ${id}`;
      res.status(200).json({ message: "Die tag updated successfully" });
    } else if (req.method === "DELETE") {
      const { die_id, tag_ids } = req.body; // tag_ids is an array

      if (!die_id || !tag_ids || !tag_ids.length) {
        return res
          .status(400)
          .json({ error: "Die ID and tag IDs are required." });
      }

      try {
        await sql`DELETE FROM die_tags WHERE die_id = ${die_id} AND tag_id = ANY(${tag_ids}::int[])`;
        res.status(200).json({ message: "Tags deleted successfully" });
      } catch (error) {
        console.error("Database query failed:", error);
        res.status(500).json({ error: "Failed to delete tags." });
      }
    } else {
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: "Database query failed" });
  }
}
