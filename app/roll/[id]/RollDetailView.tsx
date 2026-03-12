"use client";

import { Camera, PencilSimple } from "@phosphor-icons/react";
import BackButton from "@/components/BackButton";
import type { Roll } from "@/lib/db";
import { rollStatus } from "@/lib/status";

interface RollDetailViewProps {
  roll: Roll & {
    camera_nickname: string | null;
    camera_brand: string | null;
    camera_model: string | null;
    film_nickname: string | null;
    film_brand: string | null;
    film_name: string | null;
    film_iso: number | null;
    film_show_iso: boolean | null;
  };
  contactSheetUrl: string | null;
  onEdit: () => void;
}

function cameraLabel(roll: RollDetailViewProps["roll"]): string {
  if (roll.camera_nickname) return roll.camera_nickname;
  if (roll.camera_brand && roll.camera_model) return `${roll.camera_brand} ${roll.camera_model}`;
  return "";
}

function filmLabel(roll: RollDetailViewProps["roll"]): string {
  if (roll.film_nickname) return roll.film_nickname;
  if (roll.film_brand && roll.film_name) {
    const iso = roll.film_show_iso && roll.film_iso ? ` ${roll.film_iso}` : "";
    return `${roll.film_brand} ${roll.film_name}${iso}`;
  }
  return "";
}

export function RollDetailView({ roll, contactSheetUrl, onEdit }: RollDetailViewProps) {
  const status = rollStatus(roll);
  const cam = cameraLabel(roll);
  const film = filmLabel(roll);

  const dateField =
    roll.archived_at ? roll.archived_at :
    roll.processed_at ? roll.processed_at :
    roll.scanned_at ? roll.scanned_at :
    roll.lab_at ? roll.lab_at :
    roll.fridge_at;

  const dateStr = dateField
    ? new Date(dateField).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : null;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--darkroom-bg)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
        <BackButton />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm" style={{ color: "var(--darkroom-text-primary)" }}>
            {roll.roll_number}
          </div>
          <div className="text-[9px] uppercase tracking-wide mt-0.5" style={{ color: "var(--darkroom-text-tertiary)" }}>
            {cam && film ? `${cam} • ${film}` : cam || film || "—"}
          </div>
        </div>
        <button
          onClick={onEdit}
          className="p-2 active:scale-90 transition-transform"
          aria-label="Edit roll"
        >
          <PencilSimple size={18} weight="regular" style={{ color: "var(--darkroom-accent)" }} />
        </button>
      </div>

      {/* Contact Sheet or Empty State */}
      <div className="flex-1 px-4 py-6">
        {contactSheetUrl ? (
          <img
            src={contactSheetUrl}
            alt={`Contact sheet for roll ${roll.roll_number}`}
            className="w-full h-auto"
            style={{ borderRadius: 8 }}
          />
        ) : (
          <div
            className="h-full flex flex-col items-center justify-center"
            style={{ backgroundColor: "var(--darkroom-card)", borderRadius: 8, border: `1px solid var(--darkroom-border-subtle)` }}
          >
            <Camera size={48} weight="thin" style={{ color: "#333" }} />
            <div className="mt-4 text-xs font-medium tracking-wide" style={{ color: "var(--darkroom-text-tertiary)" }}>
              LOADED IN CAMERA
            </div>
            <div className="mt-1 text-[9px]" style={{ color: "var(--darkroom-text-disabled)" }}>
              Contact sheet will appear after scanning
            </div>
          </div>
        )}
      </div>

      {/* Metadata Strip */}
      <div className="flex gap-6 px-4 py-3 border-t" style={{ borderColor: "var(--darkroom-border)" }}>
        <div className="flex-1">
          <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
            Status
          </div>
          <div className="text-[10px]" style={{ color: "var(--darkroom-text-primary)" }}>
            {status}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
            Date
          </div>
          <div className="text-[10px]" style={{ color: "var(--darkroom-text-primary)" }}>
            {dateStr || "—"}
          </div>
        </div>
        <div className="flex-[2] min-w-0">
          <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
            Notes
          </div>
          <div className="text-[10px] italic truncate" style={{ color: "var(--darkroom-text-secondary)" }}>
            {roll.notes || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
