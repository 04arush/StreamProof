"use client";

import { useState } from "react";

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-4 border-b border-border py-3">
      <span className="w-28 shrink-0 text-[13px] text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent font-mono text-[14px] text-foreground outline-none"
      />
    </label>
  );
}

export default function PlatformScreen() {
  const [artistId, setArtistId] = useState("1001");
  const [trackId, setTrackId] = useState("5555");
  const [periodId, setPeriodId] = useState("202609");
  const [root, setRoot] = useState(
    "7264772886412666791416272095986303450893289674225826523000387371307532192431"
  );
  const [status, setStatus] = useState<{
    kind: "idle" | "pending" | "ok" | "error";
    message?: string;
    txHash?: string;
  }>({ kind: "idle" });

  async function handleSubmit() {
    setStatus({ kind: "pending" });
    const res = await fetch("/api/post-commitment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artistId, trackId, periodId, root }),
    });
    const data = await res.json();
    if (data.txHash) {
      setStatus({ kind: "ok", txHash: data.txHash });
    } else {
      setStatus({ kind: "error", message: data.error });
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground">
        Post a commitment
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
        Records a Merkle root on-chain for one artist, track, and settlement
        period. This is the platform&rsquo;s side of the flow — the artist
        proves against it later without seeing these values again.
      </p>

      <div className="mt-8">
        <Field label="Artist ID" value={artistId} onChange={setArtistId} />
        <Field label="Track ID" value={trackId} onChange={setTrackId} />
        <Field label="Period ID" value={periodId} onChange={setPeriodId} />
        <Field label="Merkle root" value={root} onChange={setRoot} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={status.kind === "pending"}
        className="mt-8 border border-accent px-5 py-2.5 font-mono text-[13px] text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
      >
        {status.kind === "pending" ? "Posting…" : "Post commitment"}
      </button>

      {status.kind === "ok" && (
        <p className="mt-6 font-mono text-[13px] text-foreground">
          Posted —{" "}

          <a href={`https://testnet.arcscan.app/tx/${status.txHash}`}
            target="_blank"
            rel="noreferrer"
            className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            view on ArcScan
          </a>
        </p>
      )}
      {status.kind === "error" && (
        <p className="mt-6 text-[13px] text-danger">{status.message}</p>
      )}
    </div>
  );
}
