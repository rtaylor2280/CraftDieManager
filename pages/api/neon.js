// app/actions.ts
"use server";
import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    // Fetch all rows from the locations table
    const rows = await sql`SELECT * FROM locations`;
    res.status(200).json(rows);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: "Database query failed" });
  }
}
