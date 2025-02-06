import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  const { query } = req.query;

  try {
    if (!query) {
      const dies = await sql`SELECT id, name, search_vector FROM dies`;
      return res.status(200).json({ dies });
    }

    console.log(`User query: ${query}`);
    const result = await sql`
      SELECT id, name, search_vector
      FROM dies
      WHERE search_vector @@ websearch_to_tsquery('english', ${query});
    `;

    res.status(200).json({ dies: result });
  } catch (error) {
    console.error("Error searching dies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
