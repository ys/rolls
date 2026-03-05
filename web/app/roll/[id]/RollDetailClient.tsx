"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import type { Roll, Camera, Film } from "@/lib/db";
import { STATUS_COLORS } from "@/lib/status";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "markdown-toolbar": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { for: string }, HTMLElement>;
      "md-bold": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-italic": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-strikethrough": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-link": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-image": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-unordered-list": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-ordered-list": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-task-list": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-code": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-quote": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-header": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { level?: string }, HTMLElement>;
    }
  }
}

const TIMESTAMP_FIELDS = [
  { key: "fridge_at",    label: "Fridge",    type: "datetime-local" },
  { key: "lab_at",       label: "Lab",       type: "datetime-local" },
  { key: "scanned_at",   label: "Scanned",   type: "date" },
  { key: "processed_at", label: "Processed", type: "datetime-local" },
  { key: "uploaded_at",  label: "Uploaded",  type: "datetime-local" },
  { key: "archived_at",  label: "Archived",  type: "datetime-local" },
] as const;

type TsKey = typeof TIMESTAMP_FIELDS[number]["key"];

const NEXT_ACTION: Record<string, { label: string; field: TsKey; isDate?: boolean }> = {
  LOADED:    { label: "Move to Fridge", field: "fridge_at" },
  FRIDGE:    { label: "Send to Lab",    field: "lab_at" },
  LAB:       { label: "Mark Scanned",  field: "scanned_at", isDate: true },
  SCANNED:   { label: "Mark Processed", field: "processed_at" },
  PROCESSED: { label: "Mark Uploaded", field: "uploaded_at" },
  UPLOADED:  { label: "Archive",       field: "archived_at" },
};

function cameraLabel(c: Camera): string {
  return c.nickname ?? `${c.brand} ${c.model}`;
}

function filmLabel(f: Film): string {
  if (f.nickname) return f.nickname;
  const iso = f.show_iso && f.iso ? ` ${f.iso}` : "";
  return `${f.brand} ${f.name}${iso}`;
}

interface Props {
  roll: Roll;
  status: string;
  cameras: Camera[];
  films: Film[];
}

export default function RollDetailClient({ roll: initialRoll, status: initialStatus, cameras, films }: Props) {
  const router = useRouter();
  const [roll, setRoll] = useState(initialRoll);
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialRoll.notes ?? "");
  const [labName, setLabName] = useState(initialRoll.lab_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDates, setShowDates] = useState(false);
  const [notesMode, setNotesMode] = useState<"edit" | "preview">("edit");
  const [editMeta, setEditMeta] = useState(false);
  const [metaForm, setMetaForm] = useState({
    camera_id: initialRoll.camera_id ?? "",
    film_id: initialRoll.film_id ?? "",
    shot_at: initialRoll.shot_at ? String(initialRoll.shot_at).slice(0, 10) : "",
    album_name: initialRoll.album_name ?? "",
    tags: initialRoll.tags?.join(", ") ?? "",
  });

  useEffect(() => {
    import("@github/markdown-toolbar-element");
  }, []);

  const nextAction = NEXT_ACTION[status];
  const currentCamera = cameras.find((c) => c.id === roll.camera_id) ?? null;
  const currentFilm = films.find((f) => f.id === roll.film_id) ?? null;

  async function save(patch: Partial<Roll>): Promise<boolean> {
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
    let ok = false;
    if (resp.ok) {
      const updated = await resp.json();
      setRoll(updated);
      const s = updated.archived_at ? "ARCHIVED"
        : updated.uploaded_at  ? "UPLOADED"
        : updated.processed_at ? "PROCESSED"
        : updated.scanned_at   ? "SCANNED"
        : updated.lab_at       ? "LAB"
        : updated.fridge_at    ? "FRIDGE"
        : "LOADED";
      setStatus(s);
      setSaved(true);
      router.refresh();
      ok = true;
    }
    setSaving(false);
    return ok;
  }

  function nowValue(isDate?: boolean) {
    const now = new Date();
    return isDate ? now.toISOString().slice(0, 10) : now.toISOString().slice(0, 16);
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-mono font-bold">{roll.roll_number}</h1>
          <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[status]}`}>
            {status}
          </span>
        </div>
        <a href="/" className="text-zinc-500 text-sm hover:text-zinc-900 dark:hover:text-white">← Back</a>
      </div>

      {/* Next-step action button */}
      {nextAction && (
        <div className="mb-4 space-y-2">
          {status === "FRIDGE" && (
            <input
              type="text"
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              placeholder="Lab name (optional)"
              className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-white/20"
            />
          )}
          <button
            onClick={() => {
              const patch: Partial<Roll> = { [nextAction.field]: nowValue(nextAction.isDate) };
              if (status === "FRIDGE" && labName) patch.lab_name = labName;
              save(patch);
            }}
            disabled={saving}
            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-semibold text-base active:scale-95 transition-transform disabled:opacity-50"
          >
            {saving ? "Saving…" : nextAction.label}
          </button>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl mb-4 border border-zinc-100 dark:border-transparent">
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-medium">Info</span>
          {editMeta ? (
            <button
              onClick={() => setEditMeta(false)}
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setEditMeta(true)}
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {editMeta ? (
          <div className="px-4 pb-4 pt-2 space-y-3">
            <div>
              <label className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Camera</label>
              <div className="relative">
                <select
                  value={metaForm.camera_id}
                  onChange={(e) => setMetaForm((f) => ({ ...f, camera_id: e.target.value }))}
                  className="w-full appearance-none bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-white/20 pr-8"
                >
                  <option value="">— none —</option>
                  {cameras.map((c) => (
                    <option key={c.id} value={c.id}>{cameraLabel(c)}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">▾</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Film</label>
              <div className="relative">
                <select
                  value={metaForm.film_id}
                  onChange={(e) => setMetaForm((f) => ({ ...f, film_id: e.target.value }))}
                  className="w-full appearance-none bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-white/20 pr-8"
                >
                  <option value="">— none —</option>
                  {films.map((f) => (
                    <option key={f.id} value={f.id}>{filmLabel(f)}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">▾</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Shot at</label>
              <input
                type="date"
                value={metaForm.shot_at}
                onChange={(e) => setMetaForm((f) => ({ ...f, shot_at: e.target.value }))}
                className="w-full appearance-none bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-white/20"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Album</label>
              <input
                type="text"
                value={metaForm.album_name}
                onChange={(e) => setMetaForm((f) => ({ ...f, album_name: e.target.value }))}
                placeholder="Album name"
                className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-white/20"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Tags</label>
              <input
                type="text"
                value={metaForm.tags}
                onChange={(e) => setMetaForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="travel, street"
                className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-white/20"
              />
            </div>

            <button
              onClick={async () => {
                const ok = await save({
                  camera_id: metaForm.camera_id || null,
                  film_id: metaForm.film_id || null,
                  shot_at: metaForm.shot_at || null,
                  album_name: metaForm.album_name || null,
                  tags: metaForm.tags ? metaForm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
                });
                if (ok) setEditMeta(false);
              }}
              disabled={saving}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-3 rounded-lg text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        ) : (
          <div className="px-4 pb-4 pt-2 space-y-3">
            <Row label="Camera" value={currentCamera ? cameraLabel(currentCamera) : roll.camera_id ?? "—"} />
            <Row label="Film"   value={currentFilm ? filmLabel(currentFilm) : roll.film_id ?? "—"} />
            <Row label="Shot"   value={roll.shot_at ? new Date(roll.shot_at).toLocaleDateString() : "—"} />
            {roll.lab_name && <Row label="Lab" value={roll.lab_name} />}
            {roll.album_name && <Row label="Album" value={roll.album_name} />}
            {roll.tags && roll.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap pt-1">
                {roll.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl mb-4 overflow-hidden border border-zinc-100 dark:border-transparent">
        <button
          onClick={() => setShowDates((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <span>Dates</span>
          <span>{showDates ? "▴" : "▾"}</span>
        </button>
        {showDates && (
          <div className="px-4 pb-4 space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
            {TIMESTAMP_FIELDS.map(({ key, label, type }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-zinc-600 dark:text-zinc-400">{label}</label>
                  {roll[key] ? (
                    <button
                      onClick={() => save({ [key]: null })}
                      className="text-xs text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400"
                      title="Clear"
                    >
                      Clear
                    </button>
                  ) : (
                    <button
                      onClick={() => save({ [key]: nowValue(type === "date") })}
                      className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                    >
                      Now
                    </button>
                  )}
                </div>
                <input
                  type={type}
                  key={roll[key] ?? "empty"}
                  defaultValue={roll[key] ? (type === "date" ? roll[key]!.slice(0, 10) : roll[key]!.slice(0, 16)) : ""}
                  onBlur={(e) => {
                    if (e.target.value) save({ [key]: e.target.value });
                  }}
                  className="w-full min-w-0 appearance-none bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-white/20"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Sheet */}
      {roll.contact_sheet_url && (
        <div className="mb-4">
          <img
            src={roll.contact_sheet_url}
            alt={`Contact sheet for ${roll.roll_number}`}
            className="w-full rounded-xl"
          />
        </div>
      )}

      {/* Notes */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 mb-4 border border-zinc-100 dark:border-transparent">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">Notes</label>
          <div className="flex rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 text-xs">
            <button
              onClick={() => setNotesMode("edit")}
              className={`px-3 py-1 transition-colors ${notesMode === "edit" ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
            >
              Edit
            </button>
            <button
              onClick={() => setNotesMode("preview")}
              className={`px-3 py-1 transition-colors ${notesMode === "preview" ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
            >
              Preview
            </button>
          </div>
        </div>

        {notesMode === "edit" ? (
          <>
            <markdown-toolbar for="notes-textarea" className="flex flex-wrap gap-1 mb-2">
              <md-bold><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm font-bold transition-colors">B</button></md-bold>
              <md-italic><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm italic transition-colors">I</button></md-italic>
              <md-strikethrough><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm transition-colors line-through">S</button></md-strikethrough>
              <md-link><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm transition-colors">Link</button></md-link>
              <md-unordered-list><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm transition-colors">• List</button></md-unordered-list>
              <md-ordered-list><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm transition-colors">1. List</button></md-ordered-list>
              <md-task-list><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm transition-colors">☐ Task</button></md-task-list>
              <md-code><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm font-mono transition-colors">&lt;/&gt;</button></md-code>
              <md-quote><button type="button" className="px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm transition-colors">❝ Quote</button></md-quote>
            </markdown-toolbar>
            <textarea
              id="notes-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              placeholder="Write notes in markdown…"
              className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-white/20 resize-none font-mono"
            />
          </>
        ) : (
          <div
            className="min-h-[120px] text-sm text-zinc-900 dark:text-zinc-100
              [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2
              [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-2
              [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1
              [&_p]:mb-3 [&_p]:leading-relaxed
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul_li]:mb-1
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol_li]:mb-1
              [&_code]:bg-zinc-100 dark:[&_code]:bg-zinc-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
              [&_pre]:bg-zinc-100 dark:[&_pre]:bg-zinc-800 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:mb-3 [&_pre]:overflow-x-auto
              [&_pre_code]:bg-transparent [&_pre_code]:p-0
              [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-300 dark:[&_blockquote]:border-zinc-600 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-600 dark:[&_blockquote]:text-zinc-400 [&_blockquote]:mb-3
              [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline
              [&_hr]:border-zinc-200 dark:[&_hr]:border-zinc-700 [&_hr]:my-4
              [&_strong]:font-semibold [&_em]:italic"
            dangerouslySetInnerHTML={{ __html: notes ? marked.parse(notes) as string : "<span class='text-zinc-400 dark:text-zinc-600'>No notes yet.</span>" }}
          />
        )}

        {notesMode === "edit" && (
          <button
            onClick={() => save({ notes })}
            disabled={saving}
            className="mt-3 w-full bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Notes"}
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
