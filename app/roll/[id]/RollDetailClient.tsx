"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import type { Roll, Camera, Film, CatalogFilm } from "@/lib/db";
import { STATUS_COLORS } from "@/lib/status";
import { invalidateCache } from "@/lib/cache";
import BackButton from "@/components/BackButton";
import FormButton from "@/components/FormButton";
import Sheet from "@/components/Sheet";
import FilmPickerSheet from "@/components/FilmPickerSheet";
import { DotsThreeOutline, Check, Camera as CameraIcon, FilmStrip } from "@phosphor-icons/react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "markdown-toolbar": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { for: string }, HTMLElement>;
      "md-bold": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-italic": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-strikethrough": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-link": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "md-image": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { src?: string; alt?: string }, HTMLElement>;
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

const inputCls = "w-full appearance-none rounded-none bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white py-2 text-sm focus:outline-none transition-colors";
const labelCls = "block text-[10px] uppercase tracking-widest text-zinc-400 mb-1";

function cameraLabel(c: Camera): string {
  return c.nickname ?? `${c.brand} ${c.model}`;
}

function filmLabel(f: Film | CatalogFilm): string {
  if (f.nickname) return f.nickname;
  const iso = f.show_iso && f.iso ? ` ${f.iso}` : "";
  return `${f.brand} ${f.name}${iso}`;
}

interface Props {
  roll: Roll;
  status: string;
  cameras: Camera[];
  films: Film[];
  catalogFilms: CatalogFilm[];
}

export default function RollDetailClient({ roll: initialRoll, status: initialStatus, cameras, films, catalogFilms }: Props) {
  const router = useRouter();
  const [roll, setRoll] = useState(initialRoll);
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialRoll.notes ?? "");
  const [labName, setLabName] = useState(initialRoll.lab_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDates, setShowDates] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notesMode, setNotesMode] = useState<"edit" | "preview">("edit");
  const [editMeta, setEditMeta] = useState(false);
  const [editAll, setEditAll] = useState(false);
  const [showMetaSheet, setShowMetaSheet] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [filmPickerOpen, setFilmPickerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [metaForm, setMetaForm] = useState({
    roll_number: initialRoll.roll_number,
    camera_id: cameras.find((c) => c.uuid === initialRoll.camera_uuid)?.slug ?? "",
    film_id: films.find((f) => f.uuid === initialRoll.film_uuid)?.slug ?? "",
    shot_at: initialRoll.shot_at ? String(initialRoll.shot_at).slice(0, 10) : "",
    album_name: initialRoll.album_name ?? "",
    tags: initialRoll.tags?.join(", ") ?? "",
    push_pull: initialRoll.push_pull ?? null as number | null,
    push_pull_custom: "",
  });

  // Sync metaForm when roll updates after save (relevant in editAll mode)
  useEffect(() => {
    setMetaForm((f) => ({
      ...f,
      roll_number: roll.roll_number,
      camera_id: cameras.find((c) => c.uuid === roll.camera_uuid)?.slug ?? "",
      film_id: films.find((fi) => fi.uuid === roll.film_uuid)?.slug ?? "",
      shot_at: roll.shot_at ? String(roll.shot_at).slice(0, 10) : "",
      album_name: roll.album_name ?? "",
      tags: roll.tags?.join(", ") ?? "",
      push_pull: roll.push_pull ?? null,
      push_pull_custom: "",
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roll]);

  useEffect(() => {
    import("@github/markdown-toolbar-element");
    setMounted(true);
  }, []);

  const nextAction = NEXT_ACTION[status];
  const currentCamera = cameras.find((c) => c.uuid === roll.camera_uuid) ?? null;
  const currentFilm = films.find((f) => f.uuid === roll.film_uuid) ?? null;
  const isPostScan = ["SCANNED", "PROCESSED", "UPLOADED", "ARCHIVED"].includes(status);

  // Smart markdown list continuation
  function handleNotesKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const textarea = e.currentTarget;
    const { value, selectionStart } = textarea;

    // Enter key - continue lists
    if (e.key === "Enter" && !e.shiftKey) {
      const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const currentLine = value.slice(lineStart, selectionStart);

      // Ordered list: 1. item
      const orderedMatch = currentLine.match(/^(\s*)(\d+)\.\s/);
      if (orderedMatch) {
        const [, indent, num] = orderedMatch;
        const nextNum = parseInt(num) + 1;
        const continuation = `\n${indent}${nextNum}. `;
        e.preventDefault();
        const newValue = value.slice(0, selectionStart) + continuation + value.slice(selectionStart);
        setNotes(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + continuation.length;
        }, 0);
        return;
      }

      // Unordered list: - item or * item
      const unorderedMatch = currentLine.match(/^(\s*)([-*])\s/);
      if (unorderedMatch) {
        const [, indent, bullet] = unorderedMatch;
        const continuation = `\n${indent}${bullet} `;
        e.preventDefault();
        const newValue = value.slice(0, selectionStart) + continuation + value.slice(selectionStart);
        setNotes(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + continuation.length;
        }, 0);
        return;
      }

      // Task list: - [ ] item or - [x] item
      const taskMatch = currentLine.match(/^(\s*)- \[([ x])\]\s/);
      if (taskMatch) {
        const [, indent] = taskMatch;
        const continuation = `\n${indent}- [ ] `;
        e.preventDefault();
        const newValue = value.slice(0, selectionStart) + continuation + value.slice(selectionStart);
        setNotes(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + continuation.length;
        }, 0);
        return;
      }
    }

    // Backspace on empty list item - remove it
    if (e.key === "Backspace") {
      const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const currentLine = value.slice(lineStart, selectionStart);
      const afterCursor = value.slice(selectionStart, value.indexOf("\n", selectionStart));

      // Check if we're at the end of an empty list item
      if (afterCursor === "" || afterCursor.match(/^\s*$/)) {
        const emptyOrdered = currentLine.match(/^(\s*)\d+\.\s$/);
        const emptyUnordered = currentLine.match(/^(\s*)[-*]\s$/);
        const emptyTask = currentLine.match(/^(\s*)- \[ \]\s$/);

        if (emptyOrdered || emptyUnordered || emptyTask) {
          e.preventDefault();
          const newValue = value.slice(0, lineStart) + value.slice(selectionStart);
          setNotes(newValue);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = lineStart;
          }, 0);
          return;
        }
      }
    }
  }

  // Lock page scroll and replace nav when in pre-scan notes view
  useEffect(() => {
    if (isPostScan) return;
    document.body.setAttribute("data-notes-edit", "");
    document.body.style.overflow = "hidden";
    return () => {
      document.body.removeAttribute("data-notes-edit");
      document.body.style.overflow = "";
    };
  }, [isPostScan]);

  async function save(patch: Partial<Roll> | { camera_id?: string | null; film_id?: string | null; shot_at?: string | null; album_name?: string | null; tags?: string[]; push_pull?: number | null }): Promise<boolean> {
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

      // Invalidate rolls cache so home page refreshes
      invalidateCache("rolls");

      if (updated.roll_number !== roll.roll_number) {
        router.replace(`/roll/${updated.roll_number}`);
      } else {
        router.refresh();
      }
      ok = true;
    }
    setSaving(false);
    return ok;
  }

  function nowValue(isDate?: boolean) {
    const now = new Date();
    return isDate ? now.toISOString().slice(0, 10) : now.toISOString().slice(0, 16);
  }

  const notesPreview = (
    <div
      className="text-sm text-zinc-900 dark:text-zinc-100
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
  );

  const notesEditor = (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 mb-4 border border-zinc-100 dark:border-transparent">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Notes</span>
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
            className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white py-2 text-base focus:outline-none transition-colors resize-none font-mono"
          />
        </>
      ) : notesPreview}

      {notesMode === "edit" && (
        <div className="mt-4">
          <FormButton onClick={() => save({ notes })} disabled={saving}>
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Notes"}
          </FormButton>
        </div>
      )}
    </div>
  );

  const metaSection = (
    <div className="bg-white dark:bg-zinc-900 rounded-xl mb-4 border border-zinc-100 dark:border-transparent">
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Info</span>
        <button
          onClick={() => setEditMeta((v) => !v)}
          className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          {editMeta ? "Cancel" : "Edit"}
        </button>
      </div>

      {editMeta ? (
        <div className="px-4 pb-4 pt-2 space-y-4">
          <div className="space-y-1">
            <label className={labelCls}>Roll number</label>
            <input
              type="text"
              value={metaForm.roll_number}
              onChange={(e) => setMetaForm((f) => ({ ...f, roll_number: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Camera</label>
            <div className="relative">
              <select
                value={metaForm.camera_id}
                onChange={(e) => setMetaForm((f) => ({ ...f, camera_id: e.target.value }))}
                className={inputCls + " pr-6"}
              >
                <option value="">— none —</option>
                {cameras.map((c) => (
                  <option key={c.slug} value={c.slug}>{cameraLabel(c)}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">▾</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Film</label>
            <button
              type="button"
              onClick={() => setFilmPickerOpen(true)}
              className={inputCls + " pr-6 text-left flex items-center justify-between w-full"}
            >
              <span className={metaForm.film_id ? "" : "text-zinc-400"}>
                {metaForm.film_id
                  ? (films.find((f) => f.slug === metaForm.film_id)?.nickname ??
                     catalogFilms.find((f) => f.slug === metaForm.film_id)?.nickname ??
                     metaForm.film_id)
                  : "— none —"}
              </span>
              <span className="text-zinc-400 text-xs">▾</span>
            </button>
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Shot at</label>
            <input
              type="date"
              value={metaForm.shot_at}
              onChange={(e) => setMetaForm((f) => ({ ...f, shot_at: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Album</label>
            <input
              type="text"
              value={metaForm.album_name}
              onChange={(e) => setMetaForm((f) => ({ ...f, album_name: e.target.value }))}
              placeholder="Album name"
              className={inputCls}
            />
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Tags</label>
            <input
              type="text"
              value={metaForm.tags}
              onChange={(e) => setMetaForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="travel, street"
              className={inputCls}
            />
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Push / Pull</label>
            <div className="flex gap-1 flex-wrap">
              {[-2, -1, 0, 1, 2].map((v) => {
                const label = v > 0 ? `+${v}` : `${v}`;
                const active = metaForm.push_pull === v && metaForm.push_pull_custom === "";
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      if (active) {
                        setMetaForm((f) => ({ ...f, push_pull: null, push_pull_custom: "" }));
                      } else {
                        setMetaForm((f) => ({ ...f, push_pull: v, push_pull_custom: "" }));
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-mono border transition-colors ${
                      active
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                        : "border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-zinc-600 dark:hover:border-zinc-300"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
              <input
                type="number"
                step="0.5"
                value={metaForm.push_pull_custom}
                onChange={(e) => {
                  const raw = e.target.value;
                  setMetaForm((f) => ({
                    ...f,
                    push_pull_custom: raw,
                    push_pull: raw !== "" ? parseFloat(raw) : null,
                  }));
                }}
                placeholder="other"
                className="w-16 appearance-none rounded-none bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white py-1 text-xs text-center font-mono focus:outline-none transition-colors"
              />
            </div>
          </div>

          <FormButton
            onClick={async () => {
              const ok = await save({
                roll_number: metaForm.roll_number || roll.roll_number,
                camera_id: metaForm.camera_id || null,
                film_id: metaForm.film_id || null,
                shot_at: metaForm.shot_at || null,
                album_name: metaForm.album_name || null,
                tags: metaForm.tags ? metaForm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
                push_pull: metaForm.push_pull,
              });
              if (ok) setEditMeta(false);
            }}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </FormButton>
        </div>
      ) : (
        <div className="px-4 pb-4 pt-2 space-y-3">
          <Row label="Camera" value={currentCamera ? cameraLabel(currentCamera) : "—"} />
          <Row label="Film"   value={currentFilm ? filmLabel(currentFilm) : "—"} />
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
          {roll.push_pull != null && (
            <Row label="Push / Pull" value={roll.push_pull > 0 ? `+${roll.push_pull}` : `${roll.push_pull}`} />
          )}
        </div>
      )}
    </div>
  );

  const datesSection = (
    <div className="bg-white dark:bg-zinc-900 rounded-xl mb-4 overflow-hidden border border-zinc-100 dark:border-transparent">
      <button
        onClick={() => setShowDates((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
      >
        <span>Dates</span>
        <span>{showDates ? "▴" : "▾"}</span>
      </button>
      {showDates && (
        <div className="px-4 pb-4 space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          {TIMESTAMP_FIELDS.map(({ key, label, type }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase tracking-widest text-zinc-400">{label}</label>
                {roll[key] ? (
                  <button
                    onClick={() => save({ [key]: null })}
                    className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    Clear
                  </button>
                ) : (
                  <button
                    onClick={() => save({ [key]: nowValue(type === "date") })}
                    className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
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
                className={inputCls}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const actionButton = nextAction && (
    <div className="mb-6 space-y-4">
      {status === "FRIDGE" && (
        <div className="space-y-1">
          <label className={labelCls}>Lab name</label>
          <input
            type="text"
            value={labName}
            onChange={(e) => setLabName(e.target.value)}
            placeholder="optional"
            className={inputCls}
          />
        </div>
      )}
      <FormButton
        onClick={() => {
          const patch: Partial<Roll> = { [nextAction.field]: nowValue(nextAction.isDate) };
          if (status === "FRIDGE" && labName) patch.lab_name = labName;
          save(patch);
        }}
        disabled={saving}
      >
        {saving ? "Saving…" : nextAction.label}
      </FormButton>
    </div>
  );

  async function handleDelete() {
    setDeleting(true);
    const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
    const headers: HeadersInit = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
    await fetch(`/api/rolls/${roll.roll_number}`, { method: "DELETE", headers });
    invalidateCache("rolls");
    router.push("/");
  }

  // Clean read-only view of all info + dates for post-scan view mode
  const viewCard = (
    <div className="bg-white dark:bg-zinc-900 rounded-xl mb-4 border border-zinc-100 dark:border-transparent">
      <div className="px-4 pb-4 pt-3 space-y-3">
        <Row label="Camera" value={currentCamera ? cameraLabel(currentCamera) : "—"} />
        <Row label="Film"   value={currentFilm ? filmLabel(currentFilm) : "—"} />
        <Row label="Shot"   value={roll.shot_at ? new Date(roll.shot_at).toLocaleDateString() : "—"} />
        {roll.lab_name && <Row label="Lab" value={roll.lab_name} />}
        {roll.album_name && <Row label="Album" value={roll.album_name} />}
        {roll.push_pull != null && (
          <Row label="Push / Pull" value={roll.push_pull > 0 ? `+${roll.push_pull}` : `${roll.push_pull}`} />
        )}
        {roll.tags && roll.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap pt-1">
            {roll.tags.map((tag) => (
              <span key={tag} className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}
        {/* Status timeline */}
        <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800">
          <RollTimeline roll={roll} />
        </div>
      </div>
    </div>
  );

  // Edit mode sections for post-scan (notes + meta form + dates all visible at once)
  const editAllSections = (
    <>
      {notesEditor}
      <div className="bg-white dark:bg-zinc-900 rounded-xl mb-4 border border-zinc-100 dark:border-transparent">
        <div className="px-4 pt-3 pb-1">
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Info</span>
        </div>
        <div className="px-4 pb-4 pt-2 space-y-4">
          <div className="space-y-1">
            <label className={labelCls}>Camera</label>
            <div className="relative">
              <select
                value={metaForm.camera_id}
                onChange={(e) => setMetaForm((f) => ({ ...f, camera_id: e.target.value }))}
                className={inputCls + " pr-6"}
              >
                <option value="">— none —</option>
                {cameras.map((c) => (
                  <option key={c.slug} value={c.slug}>{cameraLabel(c)}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">▾</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Film</label>
            <button
              type="button"
              onClick={() => setFilmPickerOpen(true)}
              className={inputCls + " pr-6 text-left flex items-center justify-between w-full"}
            >
              <span className={metaForm.film_id ? "" : "text-zinc-400"}>
                {metaForm.film_id
                  ? (films.find((f) => f.slug === metaForm.film_id)?.nickname ??
                     catalogFilms.find((f) => f.slug === metaForm.film_id)?.nickname ??
                     metaForm.film_id)
                  : "— none —"}
              </span>
              <span className="text-zinc-400 text-xs">▾</span>
            </button>
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Shot at</label>
            <input type="date" value={metaForm.shot_at} onChange={(e) => setMetaForm((f) => ({ ...f, shot_at: e.target.value }))} className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Album</label>
            <input type="text" value={metaForm.album_name} onChange={(e) => setMetaForm((f) => ({ ...f, album_name: e.target.value }))} placeholder="Album name" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Tags</label>
            <input type="text" value={metaForm.tags} onChange={(e) => setMetaForm((f) => ({ ...f, tags: e.target.value }))} placeholder="travel, street" className={inputCls} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Push / Pull</label>
            <div className="flex gap-1 flex-wrap">
              {[-2, -1, 0, 1, 2].map((v) => {
                const label = v > 0 ? `+${v}` : `${v}`;
                const active = metaForm.push_pull === v && metaForm.push_pull_custom === "";
                return (
                  <button key={v} type="button"
                    onClick={() => {
                      if (active) setMetaForm((f) => ({ ...f, push_pull: null, push_pull_custom: "" }));
                      else setMetaForm((f) => ({ ...f, push_pull: v, push_pull_custom: "" }));
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-mono border transition-colors ${active ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white" : "border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-zinc-600 dark:hover:border-zinc-300"}`}
                  >{label}</button>
                );
              })}
              <input type="number" step="0.5" value={metaForm.push_pull_custom}
                onChange={(e) => { const raw = e.target.value; setMetaForm((f) => ({ ...f, push_pull_custom: raw, push_pull: raw !== "" ? parseFloat(raw) : null })); }}
                placeholder="other"
                className="w-16 appearance-none rounded-none bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white py-1 text-xs text-center font-mono focus:outline-none transition-colors"
              />
            </div>
          </div>
          <FormButton
            onClick={async () => {
              await save({
                camera_id: metaForm.camera_id || null,
                film_id: metaForm.film_id || null,
                shot_at: metaForm.shot_at || null,
                album_name: metaForm.album_name || null,
                tags: metaForm.tags ? metaForm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
                push_pull: metaForm.push_pull,
              });
            }}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Info"}
          </FormButton>
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-xl mb-4 border border-zinc-100 dark:border-transparent">
        <div className="px-4 pt-3 pb-1">
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Dates</span>
        </div>
        <div className="px-4 pb-4 space-y-4 pt-2">
          {TIMESTAMP_FIELDS.map(({ key, label, type }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase tracking-widest text-zinc-400">{label}</label>
                {roll[key] ? (
                  <button onClick={() => save({ [key]: null })} className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">Clear</button>
                ) : (
                  <button onClick={() => save({ [key]: nowValue(type === "date") })} className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Now</button>
                )}
              </div>
              <input
                type={type}
                key={roll[key] ?? "empty"}
                defaultValue={roll[key] ? (type === "date" ? roll[key]!.slice(0, 10) : roll[key]!.slice(0, 16)) : ""}
                onBlur={(e) => { if (e.target.value) save({ [key]: e.target.value }); }}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div
      className={isPostScan ? "" : "fixed inset-0 z-30 flex flex-col bg-gray-50 dark:bg-zinc-950 px-4"}
      style={isPostScan ? {} : { paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {isPostScan ? (
        // POST-SCAN VIEW (existing layout)
        <>
          <BackButton />

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-mono font-bold">{roll.roll_number}</h1>
              <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[status]}`}>
                {status}
              </span>
            </div>
            <button
              onClick={() => setEditAll((v) => !v)}
              className="mt-1 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {editAll ? "Done" : "Edit"}
            </button>
          </div>

          {/* Contact sheet — always visible */}
          {roll.contact_sheet_url && (
            <div className="mb-4">
              <img
                src={roll.contact_sheet_url}
                alt={`Contact sheet for ${roll.roll_number}`}
                className="w-full rounded-xl"
              />
            </div>
          )}

          {editAll ? (
            <>
              {editAllSections}
              {actionButton}
            </>
          ) : (
            <>
              {notes && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 mb-4 border border-zinc-100 dark:border-transparent">
                  <span className="block text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-3">Notes</span>
                  {notesPreview}
                </div>
              )}
              {actionButton}
              {viewCard}
            </>
          )}

          {/* Delete */}
          <div className="mt-2 mb-8 flex justify-center">
            {confirmDelete ? (
              <div className="flex gap-3 items-center">
                <span className="text-xs text-zinc-400">Delete this roll?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                Delete roll
              </button>
            )}
          </div>
        </>
      ) : (
        // PRE-SCAN VIEW (Notes-app style)
        <>
          {/* Header bar */}
          <div className="pt-6 pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              {/* Roll number, status, camera, and film */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-mono font-bold">{roll.roll_number}</h1>
                {currentCamera && (
                  <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <CameraIcon size={14} weight="regular" />
                    {cameraLabel(currentCamera)}
                  </span>
                )}
                {currentFilm && (
                  <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <FilmStrip size={14} weight="regular" />
                    {filmLabel(currentFilm)}
                  </span>
                )}
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status]}`}>
                  {status}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 relative">
                {/* Three dots menu - opens actions dropdown */}
                <button
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  aria-label="Menu"
                >
                  <DotsThreeOutline size={20} weight="regular" />
                </button>

                {/* Actions dropdown */}
                {showActionsMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowActionsMenu(false)}
                    />
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 py-1 z-50">
                      {nextAction && (
                        <button
                          onClick={async () => {
                            const patch: Partial<Roll> = {
                              notes,
                              [nextAction.field]: nowValue(nextAction.isDate)
                            };
                            if (status === "FRIDGE" && labName) patch.lab_name = labName;
                            setShowActionsMenu(false);
                            const ok = await save(patch);
                            if (ok) {
                              router.push("/");
                            }
                          }}
                          disabled={saving}
                          className="w-full px-4 py-2 text-left text-sm text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                          {saving ? "Saving…" : nextAction.label}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowMetaSheet(true);
                          setShowActionsMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Edit info
                      </button>
                      <button
                        onClick={() => {
                          setConfirmDelete(true);
                          setShowActionsMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Delete roll
                      </button>
                    </div>
                  </>
                )}

                {/* Chevron down - save button */}
                <button
                  onClick={async () => {
                    const ok = await save({ notes });
                    if (ok) {
                      router.push("/");
                    }
                  }}
                  disabled={saving}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 text-white shadow-lg shadow-amber-400/40 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Save & Close"
                  title="Save & Close"
                >
                  <Check size={20} weight="bold" />
                </button>
              </div>
            </div>
          </div>

          {/* Lab name input for FRIDGE status */}
          {status === "FRIDGE" && (
            <div className="mb-3 flex-shrink-0">
              <input
                type="text"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                placeholder="Lab name (optional)"
                className="w-full appearance-none rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
              />
            </div>
          )}

          {/* Full-height notes editor */}
          <div className="flex-1 flex flex-col pb-20">
            <textarea
              id="notes-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={handleNotesKeyDown}
              onBlur={() => save({ notes })}
              placeholder="Notes…"
              className="flex-1 h-full w-full bg-transparent text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed caret-amber-400"
            />
          </div>

          {/* Metadata Sheet */}
          <Sheet open={showMetaSheet} onClose={() => setShowMetaSheet(false)} title="Roll Info">
            <div className="space-y-4 pb-6">
              {/* Roll number */}
              <div className="space-y-1">
                <label className={labelCls}>Roll number</label>
                <input
                  type="text"
                  value={metaForm.roll_number}
                  onChange={(e) => setMetaForm((f) => ({ ...f, roll_number: e.target.value }))}
                  className={inputCls}
                />
              </div>

              {/* Camera */}
              <div className="space-y-1">
                <label className={labelCls}>Camera</label>
                <div className="relative">
                  <select
                    value={metaForm.camera_id}
                    onChange={(e) => setMetaForm((f) => ({ ...f, camera_id: e.target.value }))}
                    className={inputCls + " pr-6"}
                  >
                    <option value="">— none —</option>
                    {cameras.map((c) => (
                      <option key={c.slug} value={c.slug}>{cameraLabel(c)}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">▾</span>
                </div>
              </div>

              {/* Film */}
              <div className="space-y-1">
                <label className={labelCls}>Film</label>
                <div className="relative">
                  <select
                    value={metaForm.film_id}
                    onChange={(e) => setMetaForm((f) => ({ ...f, film_id: e.target.value }))}
                    className={inputCls + " pr-6"}
                  >
                    <option value="">— none —</option>
                    {films.map((f) => (
                      <option key={f.slug} value={f.slug}>{filmLabel(f)}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">▾</span>
                </div>
              </div>

              {/* Shot at */}
              <div className="space-y-1">
                <label className={labelCls}>Shot at</label>
                <input
                  type="date"
                  value={metaForm.shot_at}
                  onChange={(e) => setMetaForm((f) => ({ ...f, shot_at: e.target.value }))}
                  className={inputCls}
                />
              </div>

              {/* Album */}
              <div className="space-y-1">
                <label className={labelCls}>Album</label>
                <input
                  type="text"
                  value={metaForm.album_name}
                  onChange={(e) => setMetaForm((f) => ({ ...f, album_name: e.target.value }))}
                  placeholder="Album name"
                  className={inputCls}
                />
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <label className={labelCls}>Tags</label>
                <input
                  type="text"
                  value={metaForm.tags}
                  onChange={(e) => setMetaForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="travel, street"
                  className={inputCls}
                />
              </div>

              {/* Push/Pull */}
              <div className="space-y-2">
                <label className={labelCls}>Push / Pull</label>
                <div className="flex gap-1 flex-wrap">
                  {[-2, -1, 0, 1, 2].map((v) => {
                    const label = v > 0 ? `+${v}` : `${v}`;
                    const active = metaForm.push_pull === v && metaForm.push_pull_custom === "";
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setMetaForm((f) => ({ ...f, push_pull: null, push_pull_custom: "" }));
                          } else {
                            setMetaForm((f) => ({ ...f, push_pull: v, push_pull_custom: "" }));
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-mono border transition-colors ${
                          active
                            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                            : "border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-zinc-600 dark:hover:border-zinc-300"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                  <input
                    type="number"
                    step="0.5"
                    value={metaForm.push_pull_custom}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setMetaForm((f) => ({
                        ...f,
                        push_pull_custom: raw,
                        push_pull: raw !== "" ? parseFloat(raw) : null,
                      }));
                    }}
                    placeholder="other"
                    className="w-16 appearance-none rounded-none bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white py-1 text-xs text-center font-mono focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <span className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-3">Dates</span>
                <div className="space-y-4">
                  {TIMESTAMP_FIELDS.map(({ key, label, type }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-400">{label}</label>
                        {roll[key] ? (
                          <button
                            onClick={() => save({ [key]: null })}
                            className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          >
                            Clear
                          </button>
                        ) : (
                          <button
                            onClick={() => save({ [key]: nowValue(type === "date") })}
                            className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
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
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <FormButton
                onClick={async () => {
                  const ok = await save({
                    roll_number: metaForm.roll_number || roll.roll_number,
                    camera_id: metaForm.camera_id || null,
                    film_id: metaForm.film_id || null,
                    shot_at: metaForm.shot_at || null,
                    album_name: metaForm.album_name || null,
                    tags: metaForm.tags ? metaForm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
                    push_pull: metaForm.push_pull,
                  });
                  if (ok) setShowMetaSheet(false);
                }}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Info"}
              </FormButton>
            </div>
          </Sheet>

          {/* Delete confirmation modal */}
          {confirmDelete && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setConfirmDelete(false)}
              />
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-200 dark:border-zinc-800 z-50 max-w-sm w-full mx-4">
                <h2 className="text-lg font-semibold mb-2">Delete Roll?</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  This will permanently delete roll {roll.roll_number}. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 px-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <FilmPickerSheet
        open={filmPickerOpen}
        onClose={() => setFilmPickerOpen(false)}
        films={films}
        catalogFilms={catalogFilms}
        value={metaForm.film_id}
        onChange={(slug) => setMetaForm((f) => ({ ...f, film_id: slug }))}
      />

      {/* Markdown editor toolbar — replaces bottom nav in pre-scan view */}
      {!isPostScan && mounted && createPortal(
        <div
          className="fixed bottom-0 inset-x-0 z-[100] flex justify-center items-end pointer-events-none px-4"
          style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
        >
          <div
            className="pointer-events-auto bg-white/40 dark:bg-zinc-900/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/60 dark:border-white/10 overflow-x-auto"
            style={{
              boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            <markdown-toolbar for="notes-textarea" className="flex items-center h-14 px-3 gap-0.5">
              <md-bold><button type="button" className="flex items-center justify-center w-11 h-11 rounded-xl font-bold text-[17px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors">B</button></md-bold>
              <md-italic><button type="button" className="flex items-center justify-center w-11 h-11 rounded-xl italic text-[17px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors">I</button></md-italic>
              <md-strikethrough><button type="button" className="flex items-center justify-center w-11 h-11 rounded-xl line-through text-[17px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors">S</button></md-strikethrough>
              <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1 shrink-0" />
              <md-unordered-list><button type="button" className="flex items-center justify-center w-11 h-11 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
              </button></md-unordered-list>
              <md-task-list><button type="button" className="flex items-center justify-center w-11 h-11 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="6" height="6" rx="1"/><polyline points="5 8 6.5 9.5 9 6.5" strokeWidth="1.5"/><line x1="13" y1="8" x2="21" y2="8"/><rect x="3" y="15" width="6" height="6" rx="1"/><line x1="13" y1="18" x2="21" y2="18"/></svg>
              </button></md-task-list>
            </markdown-toolbar>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[10px] uppercase tracking-widest text-zinc-400">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

const TIMELINE_STEPS: Array<{ key: keyof Roll; label: string; type: "date" | "datetime" }> = [
  { key: "fridge_at",    label: "Fridge",    type: "datetime" },
  { key: "lab_at",       label: "Lab",       type: "datetime" },
  { key: "scanned_at",   label: "Scanned",   type: "date"     },
  { key: "processed_at", label: "Processed", type: "datetime" },
  { key: "uploaded_at",  label: "Uploaded",  type: "datetime" },
  { key: "archived_at",  label: "Archived",  type: "datetime" },
];

function RollTimeline({ roll }: { roll: Roll }) {
  const steps = TIMELINE_STEPS.map((s) => ({ ...s, ts: roll[s.key] as string | null }));
  const lastDone = steps.reduce((acc, s, i) => (s.ts ? i : acc), -1);

  return (
    <div className="pt-2 space-y-1">
      {steps.map((step, i) => {
        const done = !!step.ts;
        const isCurrent = i === lastDone;
        return (
          <div key={step.key} className="flex gap-3 items-start">
            {/* Dot + line */}
            <div className="flex flex-col items-center shrink-0 w-4 mt-0.5">
              <div className={`w-2.5 h-2.5 rounded-full border-2 transition-colors ${done ? (isCurrent ? "bg-amber-400 border-amber-400" : "bg-zinc-400 border-zinc-400 dark:bg-zinc-500 dark:border-zinc-500") : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"}`} />
              {i < steps.length - 1 && (
                <div className={`w-px flex-1 min-h-[10px] mt-0.5 ${done && steps[i + 1]?.ts ? "bg-zinc-400 dark:bg-zinc-500" : "bg-zinc-200 dark:bg-zinc-800"}`} />
              )}
            </div>
            {/* Label + date */}
            <div className="flex justify-between flex-1 pb-1.5">
              <span className={`text-[11px] uppercase tracking-wide font-medium ${done ? (isCurrent ? "text-amber-600 dark:text-amber-400" : "text-zinc-600 dark:text-zinc-400") : "text-zinc-300 dark:text-zinc-700"}`}>
                {step.label}
              </span>
              {step.ts && (
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                  {step.type === "date"
                    ? new Date(step.ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                    : new Date(step.ts).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
