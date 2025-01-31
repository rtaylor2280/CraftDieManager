import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === "GET") {
      const { die_id } = req.query;

      if (die_id) {
        // Fetch only tag_id for the specified die_id
        try {
          const rows = await sql`
            SELECT tag_id
            FROM die_tags
            WHERE die_id = ${die_id};
          `;

          // Transform rows to a simple array of tag IDs
          const tagIds = rows.map((row) => row.tag_id);

          res.status(200).json(tagIds);
        } catch (error) {
          console.error("Database query failed:", error);
          res
            .status(500)
            .json({ error: "Failed to fetch tags for the specified die." });
        }
      } else {
        // Fetch all die_tags if no die_id is provided
        const rows = await sql`SELECT * FROM die_tags`;
        res.status(200).json(rows);
      }
    } else if (req.method === "POST") {
      const { die_id, updated_tag_ids } = req.body; // Handle dynamic updates
      const { tag_ids } = req.body; // Generic addition logic for future use

      if (updated_tag_ids) {
        try {
          // Fetch existing tags for the given die_id
          const existingTags = await sql`
            SELECT tag_id
            FROM die_tags
            WHERE die_id = ${die_id};
          `;
          const existingTagIds = existingTags.map((row) => row.tag_id);

          // Determine which tags to add and remove
          const tagsToAdd = updated_tag_ids.filter(
            (tag_id) => !existingTagIds.includes(tag_id)
          );
          const tagsToRemove = existingTagIds.filter(
            (tag_id) => !updated_tag_ids.includes(tag_id)
          );

          // Add new tags
          if (tagsToAdd.length > 0) {

            // Use a loop to insert each tag dynamically
            for (const tag_id of tagsToAdd) {
              await sql`
                INSERT INTO die_tags (die_id, tag_id)
                VALUES (${die_id}, ${tag_id});
              `;
            }
          }

          // Remove tags
          if (tagsToRemove.length > 0) {

            await sql`
              DELETE FROM die_tags
              WHERE die_id = ${die_id} AND tag_id = ANY(${tagsToRemove});
            `;
          }

          res.status(200).json({
            message: "Tags updated dynamically",
            added: tagsToAdd,
            removed: tagsToRemove,
          });
        } catch (error) {
          console.error("Error updating tags dynamically:", error);
          res.status(500).json({
            error: "Failed to update tags dynamically.",
            details: error,
          });
        }
      } else if (tag_ids) {
        try {
          // Use a loop to insert each tag dynamically
          for (const tag_id of tag_ids) {
            await sql`
              INSERT INTO die_tags (die_id, tag_id)
              VALUES (${die_id}, ${tag_id});
            `;
          }

          res.status(201).json({ message: "Tags added successfully." });
        } catch (error) {
          console.error("Error adding tags:", error);
          res
            .status(500)
            .json({ error: "Failed to add tags.", details: error });
        }
      } else {
        res
          .status(400)
          .json({ error: "Invalid request. No tag data provided." });
      }
    } else if (req.method === "DELETE") {
      const { die_id, tag_ids } = req.body; // `tag_ids` is an array

      if (!die_id || !tag_ids || !tag_ids.length) {
        return res
          .status(400)
          .json({ error: "Die ID and tag IDs are required." });
      }

      try {
        // Fetch existing tags for the given die_id
        const existingTags = await sql`
          SELECT tag_id
          FROM die_tags
          WHERE die_id = ${die_id};
        `;
        const existingTagIds = existingTags.map((row) => row.tag_id);

        // Determine which tags can be removed
        const tagsToRemove = tag_ids.filter((tag_id) =>
          existingTagIds.includes(tag_id)
        );

        if (tagsToRemove.length > 0) {
          // Use UNNEST to delete multiple rows efficiently
          await sql`
            DELETE FROM die_tags
            WHERE die_id = ${die_id} AND tag_id = ANY(${tagsToRemove}::int[])
          `;
        }

        res.status(200).json({
          message: "Tags deletion completed.",
          removed: tagsToRemove,
          notFound: tag_ids.filter(
            (tag_id) => !existingTagIds.includes(tag_id)
          ),
        });
      } catch (error) {
        console.error("Error deleting tags:", error);
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
