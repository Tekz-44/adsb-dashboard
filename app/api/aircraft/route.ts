import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    const result = await db.query(`
      SELECT 
        icao24,
        callsign,
        origin_country,
        latitude,
        longitude,
        altitude,
        velocity,
        heading,
        on_ground,
        created_at
      FROM aircraft_states
      ORDER BY created_at DESC
      LIMIT 100
    `);
    return NextResponse.json({ aircraft: result.rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
