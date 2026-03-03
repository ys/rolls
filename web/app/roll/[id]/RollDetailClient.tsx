"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Roll, Camera, Film } from "@/lib/db";
import { STATUS_COLORS } from "@/lib/status";

const TIMESTAMP_FIELDS = [
  { key: "fridge_at",    label: "Fridge",      type: "datetime-local" },
  { key: "lab_at",       label: "Lab",         type: "datetime-local" },
  { key: "scanned_at",   label: "Scanned",     type: "date" },
  { key: "processed_at", label: "Processed",   type: "datetime-local" },
  { key: "uploaded_at",  label: "Uploaded",    type: "datetime-local" },
  { key: "archived_at",  label: "Archived",    type: "datetime-local" },
] as const;

interface Props {
  roll: Roll;
  status: string;
  cameras: Camera[];
  films: Film[];
}

export default function RollDetailClient({ roll: initialRoll, status, cameras, films }: Props) {
  const router = useRouter();
  const [roll, setRoll] = useState(initialRoll);
  const [notes, setNotes] = useState(initialRoll.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const camera = cameras.find((c) => c.id === roll.camera_id);
  const film = films.find((f) => f.id === roll.film_id);

  async function save(patch: Partial<Roll>) {
    setSaving(true);
    setSaved(false);
    const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    };
    const resp = await fetch(`/api/rolls/${roll.roll_number}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(patch),
    });
    if (resp.ok) {
      const updated = await resp.json();
      setRoll(updated);
      setSaved(true);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-mono font-bold">{roll.roll_number}</h1>
          <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[status]}`}>
            {status}
          </span>
        </div>
        <a href="/" className="text-zinc-500 text-sm hover:text-white">← Back</a>
      </div>

      {/* Metadata */}
      <div className="bg-zinc-900 rounded-xl p-4 space-y-3 mb-4">
        <Row label="Camera" value={camera ? (camera.nickname ?? `${camera.brand} ${camera.model}`) : roll.camera_id ?? "—"} />
        <Row label="Film"   value={film ? (film.nickname ?? `${film.brand} ${film.name}${film.show_iso && film.iso ? ` ${film.iso}` : ""}`) : roll.film_id ?? "—"} />
        <Row label="Shot"   value={roll.shot_at ? new Date(roll.shot_at).toLocaleDateString() : "—"} />
        {roll.lab_name && <Row label="Lab" value={roll.lab_name} />}
        {roll.album_name && <Row label="Album" value={roll.album_name} />}
        {roll.tags && roll.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap pt-1">
            {roll.tags.map((tag) => (
              <span key={tag} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div className="bg-zinc-900 rounded-xl p-4 space-y-3 mb-4">
        {TIMESTAMP_FIELDS.map(({ key, label, type }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <label className="text-sm text-zinc-400 shrink-0 w-28">{label}</label>
            <div className="flex items-center gap-2 flex-1">
              <input
                type={type}
                defaultValue={roll[key] ? (type === "date" ? roll[key]!.slice(0, 10) : roll[key]!.slice(0, 16)) : ""}
                onBlur={(e) => {
                  if (e.target.value) save({ [key]: e.target.value });
                }}
                className="bg-zinc-800 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-white/20"
              />
              {!roll[key] && (
                <button
                  onClick={() => {
                    const now = new Date();
                    const val = type === "date" ? now.toISOString().slice(0, 10) : now.toISOString().slice(0, 16);
                    save({ [key]: val });
                  }}
                  className="text-xs text-zinc-500 hover:text-white whitespace-nowrap"
                >
                  Set now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="bg-zinc-900 rounded-xl p-4 mb-4">
        <label className="block text-sm text-zinc-400 mb-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 resize-none"
        />
        <button
          onClick={() => save({ notes })}
          disabled={saving}
          className="mt-3 w-full bg-zinc-700 hover:bg-zinc-600 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Notes"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
