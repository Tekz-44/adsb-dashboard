import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const response = await fetch(
      "https://opensky-network.org/api/states/all?lamin=41.5&lomin=-84.0&lamax=43.0&lomax=-82.0"
    );
    const data = await response.json();

    if (!data.states || data.states.length === 0) {
      return NextResponse.json({ message: "No aircraft in range", count: 0 });
    }

    const db = await getDb();

    let inserted = 0;
    for (const state of data.states) {
      const [icao24, callsign, origin_country, , timestamp,
             longitude, latitude, altitude, on_ground,
             velocity, heading, vertical_rate] = state;

      if (!latitude || !longitude) continue;

      await db.query(`
        INSERT INTO aircraft_states 
          (icao24, callsign, origin_country, latitude, longitude,
           altitude, velocity, heading, vertical_rate, on_ground, timestamp)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      `, [icao24, callsign?.trim(), origin_country, latitude, longitude,
          altitude, velocity, heading, vertical_rate, on_ground, timestamp]);

      inserted++;
    }

    return NextResponse.json({ message: "Ingestion complete", count: inserted });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 });
  }
}
