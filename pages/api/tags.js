import { neon } from "@neondatabase/serverless";
import { toTitleCase } from "@/utils/toTitleCase";

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === "GET" && req.query.checkTag) {
      const { tagName } = req.query;

      if (!tagName) {
        res.status(400).json({ error: "Tag name is required." });
        return;
      }

      try {
        const tagExists = await sql`
          SELECT *
          FROM tags
          WHERE LOWER(name) = LOWER(${tagName});
        `;

        if (tagExists.length > 0) {
          res.status(200).json({ exists: true });
        } else {
          res.status(200).json({ exists: false });
        }
      } catch (error) {
        console.error("Database query failed:", error);
        res.status(500).json({ error: "Database query failed" });
      }
    } else if (req.method === "GET") {
      const rows = await sql`
        SELECT 
          t.id AS tag_id, 
          t.name AS tag_name, 
          c.id AS category_id,
          c.name AS category_name
        FROM 
          tags t
        JOIN 
          categories c
        ON 
          t.category_id = c.id
        ORDER BY 
          c.name, t.name;
      `;

      // Transform data into category-wise grouping
      const categories = rows.reduce((acc, row) => {
        if (!row.category_id) {
          console.error("Invalid Row:", row);
          return acc;
        }

        const category = acc.find(
          (cat) => cat.category_name === row.category_name
        );
        if (category) {
          category.tags.push({ tag_id: row.tag_id, tag_name: row.tag_name });
        } else {
          acc.push({
            category_name: row.category_name,
            tags: [{ tag_id: row.tag_id, tag_name: row.tag_name }],
          });
        }
        return acc;
      }, []);

      res.status(200).json(categories);
    } else if (req.method === "POST") {
      const { name, category_id } = req.body;

      if (!name || typeof name !== "string" || !category_id) {
        return res
          .status(400)
          .json({ error: "Invalid or missing tag name or category ID." });
      }

      const formattedName = toTitleCase(name.trim());

      try {
        // Insert the new tag and fetch additional details
        const result = await sql`
          INSERT INTO tags (name, category_id)
          VALUES (${formattedName}, ${category_id})
          RETURNING id AS tag_id, name AS tag_name
        `;

        // Fetch the associated category name
        const category = await sql`
          SELECT name AS category_name
          FROM categories
          WHERE id = ${category_id}
        `;

        res.status(201).json({
          id: result[0].tag_id,
          name: result[0].tag_name,
          category_name: category[0]?.category_name,
          message: "Tag added successfully",
        });
      } catch (error) {
        if (error.code === "23505") {
          const existingTag = await sql`
            SELECT t.id AS tag_id, t.name AS tag_name, c.name AS category_name 
            FROM tags t
            JOIN categories c ON t.category_id = c.id
            WHERE t.name = ${formattedName} AND t.category_id = ${category_id}
          `;

          res.status(200).json({
            id: existingTag[0].tag_id,
            name: existingTag[0].tag_name,
            category_name: existingTag[0].category_name,
            message: "Tag already exists for this category",
          });
        } else {
          console.error("Database query failed:", error);
          res.status(500).json({ error: "Database query failed" });
        }
      }
    } else if (req.method === "PUT") {
      const { id, name, category_id } = req.body;
      await sql`UPDATE tags SET name = ${name}, category_id = ${category_id} WHERE id = ${id}`;
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
