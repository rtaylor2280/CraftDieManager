import { neon } from "@neondatabase/serverless";
import { toTitleCase } from "@/utils/toTitleCase";

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === "GET") {
      // Fetch all categories
      const rows =
        await sql`SELECT id AS category_id, name AS category_name FROM categories ORDER BY name`;
      res.status(200).json(rows);
    } else if (req.method === "POST") {
      const { name } = req.body;

      // Validate input
      if (!name || typeof name !== "string") {
        return res
          .status(400)
          .json({ error: "Invalid or missing category name." });
      }

      const formattedName = toTitleCase(name.trim());

      try {
        const result = await sql`
          INSERT INTO categories (name)
          VALUES (${formattedName})
          RETURNING id AS category_id
        `;

        res.status(201).json({
          id: result[0].category_id,
          message: "Category added successfully",
        });
      } catch (error) {
        if (error.code === "23505") {
          const existingCategory = await sql`
            SELECT id AS category_id, name AS category_name 
            FROM categories 
            WHERE name = ${formattedName}
          `;

          res.status(200).json({
            id: existingCategory[0].category_id,
            name: existingCategory[0].category_name,
            message: "Category already exists",
          });
        } else {
          console.error("Database query failed:", error);
          res.status(500).json({ error: "Database query failed" });
        }
      }
    } else if (req.method === "PUT") {
      const { id, name } = req.body;

      // Validate input
      if (!id || !name || typeof id !== "number" || typeof name !== "string") {
        return res.status(400).json({ error: "Invalid category ID or name." });
      }

      // Update category
      await sql`
        UPDATE categories 
        SET name = ${name} 
        WHERE id = ${id}
      `;
      res.status(200).json({ message: "Category updated successfully" });
    } else if (req.method === "DELETE") {
      const { id } = req.body;

      // Validate input
      if (!id || typeof id !== "number") {
        return res.status(400).json({ error: "Invalid category ID." });
      }

      // Delete category
      await sql`DELETE FROM categories WHERE id = ${id}`;
      res.status(200).json({ message: "Category deleted successfully" });
    } else {
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: "Database query failed" });
  }
}
