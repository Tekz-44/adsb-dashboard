"use client";
import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

const AircraftMap = dynamic(() => import("./components/AircraftMap"), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-800 flex items-center justify-center text-white">Loading map...</div>,
});

type Aircraft = {
  icao24: string;
  callsign: string;
  origin_country: string;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  heading: number;
  on_ground: boolean;
};

export default function Home() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [lastIngest, setLastIngest] = useState<string | null>(null);
  const [ingestCount, setIngestCount] = useState<number | null>(null);

  const fetchAircraft = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/aircraft");
      const data = await res.json();
      setAircraft(data.aircraft || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const ingest = async () => {
    setIngesting(true);
    try {
      const res = await fetch("/api/ingest");
      const data = await res.json();
      setIngestCount(data.count);
      setLastIngest(new Date().toLocaleTimeString());
      await fetchAircraft();
    } catch (err) {
      console.error(err);
    } finally {
      setIngesting(false);
    }
  };

  useEffect(() => {
    fetchAircraft();
  }, [fetchAircraft]);

  const airborne = aircraft.filter((a) => !a.on_ground);
  const onGround = aircraft.filter((a) => a.on_ground);
  const countries = [...new Set(aircraft.map((a) => a.origin_country))].length;
  const avgAlt = airborne.length
    ? Math.round(airborne.reduce((sum, a) => sum + (a.altitude || 0), 0) / airborne.length)
    : 0;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-400">✈ ADS-B Aviation Analytics</h1>
          <p className="text-gray-400 mt-1">Live aircraft tracking around Detroit Metro (KDTW) — powered by Aurora DSQL</p>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-6 items-center">
          <button
            onClick={ingest}
            disabled={ingesting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 px-6 py-2 rounded font-semibold transition"
          >
            {ingesting ? "Ingesting..." : "Ingest Live Data"}
          </button>
          <button
            onClick={fetchAircraft}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded font-semibold transition"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          {lastIngest && (
            <span className="text-gray-400 text-sm">
              Last ingest: {lastIngest} — {ingestCount} aircraft added
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Tracked", value: aircraft.length },
            { label: "Airborne", value: airborne.length },
            { label: "On Ground", value: onGround.length },
            { label: "Countries", value: countries },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
          <AircraftMap aircraft={aircraft} />
        </div>

        {/* Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                {["ICAO24", "Callsign", "Country", "Altitude (m)", "Speed (m/s)", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aircraft.slice(0, 20).map((a, i) => (
                <tr key={`${a.icao24}-${i}`} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="px-4 py-2 font-mono text-blue-400">{a.icao24}</td>
                  <td className="px-4 py-2">{a.callsign || "—"}</td>
                  <td className="px-4 py-2">{a.origin_country}</td>
                  <td className="px-4 py-2">{a.altitude ? Math.round(a.altitude) : "—"}</td>
                  <td className="px-4 py-2">{a.velocity ? Math.round(a.velocity) : "—"}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${a.on_ground ? "bg-gray-600" : "bg-blue-900 text-blue-300"}`}>
                      {a.on_ground ? "Ground" : "Airborne"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {aircraft.length === 0 && (
            <p className="text-center text-gray-500 py-8">No aircraft data yet — click "Ingest Live Data" to start</p>
          )}
        </div>
      </div>
    </main>
  );
}
