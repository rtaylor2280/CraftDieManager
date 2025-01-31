import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === "GET") {
      const { id, field } = req.query; // Extract the ID and field from the query parameters

      if (id && field === "links") {
        // Fetch only the links field for a specific die by ID
        const [result] = await sql`SELECT links FROM dies WHERE id = ${id}`;
        if (!result) {
          return res.status(404).json({ error: "Die not found" });
        }
        return res.status(200).json({ links: result.links });
      } else if (id) {
        // Fetch a specific die by ID
        const [die] = await sql`SELECT * FROM dies WHERE id = ${id}`;
        if (!die) {
          return res.status(404).json({ error: "Die not found" });
        }
        return res.status(200).json(die);
      } else {
        // Fetch all dies
        const rows = await sql`SELECT * FROM dies`;
        return res.status(200).json(rows);
      }
    } else if (req.method === "POST") {
      const {
        name,
        description,
        location_id,
        primary_image,
        additional_images,
        links,
      } = req.body;
      console.log(req.body);

      if (!name) {
        return res.status(400).json({ error: "Name is required." });
      }

      const [newDie] = await sql`
        INSERT INTO dies (name, description, location_id, primary_image, additional_images, links)
        VALUES (
          ${name}, 
          ${description || null}, 
          ${location_id || null}, 
          ${primary_image || null}, 
          ${additional_images ? JSON.stringify(additional_images) : null}, 
          ${links ? JSON.stringify(links) : null}
        )
        RETURNING id
      `;
      return res
        .status(201)
        .json({ message: "Die added successfully", id: newDie.id });
    } else if (req.method === "PUT") {
      const {
        id,
        name,
        description,
        location_id,
        primary_image,
        additional_images,
        links,
      } = req.body;

      if (!id) {
        return res
          .status(400)
          .json({ error: "ID is required for updating a die." });
      }

      try {
        const updates = [];
        const values = [];

        // Dynamically construct the SET clause and collect values
        if (name !== undefined) {
          updates.push(`name = $${updates.length + 1}`);
          values.push(name);
        }
        if (description !== undefined) {
          updates.push(`description = $${updates.length + 1}`);
          values.push(description || null);
        }
        if (location_id !== undefined) {
          updates.push(`location_id = $${updates.length + 1}`);
          values.push(location_id || null);
        }
        if (primary_image !== undefined) {
          updates.push(`primary_image = $${updates.length + 1}`);
          values.push(primary_image);
        }
        if (additional_images !== undefined) {
          updates.push(`additional_images = $${updates.length + 1}`);
          values.push(
            additional_images ? JSON.stringify(additional_images) : null
          );
        }
        if (links !== undefined) {
          updates.push(`links = $${updates.length + 1}`);
          values.push(links ? JSON.stringify(links) : null);
        }

        if (updates.length === 0) {
          return res
            .status(400)
            .json({ error: "No fields provided to update." });
        }

        // Add the ID as the last parameter
        values.push(id);

        // Build the query dynamically
        const query = `
          UPDATE dies
          SET ${updates.join(", ")}
          WHERE id = $${values.length}
        `;

        // Execute the query with parameterized values
        await sql(query, values);

        return res.status(200).json({ message: "Die updated successfully" });
      } catch (error) {
        console.error("Database query failed:", error);
        return res.status(500).json({ error: "Failed to update the die." });
      }
    } else if (req.method === "DELETE") {
      const { id } = req.body;

      if (!id) {
        return res
          .status(400)
          .json({ error: "ID is required to delete a die." });
      }

      await sql`DELETE FROM dies WHERE id = ${id}`;
      return res.status(200).json({ message: "Die deleted successfully" });
    } else {
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: "Database query failed" });
  }
}
