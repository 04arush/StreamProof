"use client";

import { useState } from "react";

export default function PlatformScreen() {
  const [artistId, setArtistId] = useState("1001");
  const [trackId, setTrackId] = useState("5555");
  const [periodId, setPeriodId] = useState("202609");
  const [root, setRoot] = useState("7264772886412666791416272095986303450893289674225826523000387371307532192431");
  const [status, setStatus] = useState("");

  async function handleSubmit() {
    setStatus("Posting commitment...");
    const res = await fetch("/api/post-commitment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artistId, trackId, periodId, root })
    });
    const data = await res.json();
    setStatus(data.txHash ? `Posted: ${data.txHash}` : `Error: ${data.error}`);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Platform — Post Commitment</h1>
      <label>Artist ID: <input value={artistId} onChange={(e) => setArtistId(e.target.value)} /></label><br />
      <label>Track ID: <input value={trackId} onChange={(e) => setTrackId(e.target.value)} /></label><br />
      <label>Period ID: <input value={periodId} onChange={(e) => setPeriodId(e.target.value)} /></label><br />
      <label>Merkle Root (0x...): <input value={root} onChange={(e) => setRoot(e.target.value)} style={{ width: 400 }} /></label><br />
      <button onClick={handleSubmit}>Post Commitment</button>
      <p>{status}</p>
    </div>
  );
}
