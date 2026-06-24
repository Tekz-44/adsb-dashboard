"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const aircraftIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61212.png",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
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

function RotatedMarker({ aircraft }: { aircraft: Aircraft }) {
  return (
    <Marker
      position={[aircraft.latitude, aircraft.longitude]}
      icon={aircraftIcon}
    >
      <Popup>
        <div className="text-sm">
          <p className="font-bold">{aircraft.callsign || aircraft.icao24}</p>
          <p>Country: {aircraft.origin_country}</p>
          <p>Altitude: {aircraft.altitude ? `${Math.round(aircraft.altitude)}m` : "Ground"}</p>
          <p>Speed: {aircraft.velocity ? `${Math.round(aircraft.velocity)} m/s` : "N/A"}</p>
          <p>Heading: {aircraft.heading ? `${Math.round(aircraft.heading)}°` : "N/A"}</p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function AircraftMap({ aircraft }: { aircraft: Aircraft[] }) {
  return (
    <MapContainer
      center={[42.3, -83.0]}
      zoom={8}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {aircraft
        .filter((a) => a.latitude && a.longitude)
        .map((a) => (
          <RotatedMarker key={a.icao24} aircraft={a} />
        ))}
    </MapContainer>
  );
}
