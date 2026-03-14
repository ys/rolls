"use client";

import { createPortal } from "react-dom";
import type { Roll } from "@/lib/db";
import { rollStatus } from "@/lib/status";

interface RollEditSheetProps {
  roll: Roll & {
    camera_nickname: string | null;
    camera_brand: string | null;
    camera_model: string | null;
    film_nickname: string | null;
    film_brand: string | null;
    film_name: string | null;
  };
  onClose: () => void;
  onSave: (updates: Partial<Roll>) => Promise<void>;
  onMoveToNext?: (labName?: string) => Promise<void>;
}

export function RollEditSheet({ roll, onClose, onMoveToNext }: RollEditSheetProps) {
  const status = rollStatus(roll);
  const isLoaded = status === "LOADED" || status === "FRIDGE";
  const hasLab = status !== "LOADED" && status !== "FRIDGE";
  const hasScanned = status === "SCANNED" || status === "PROCESSED" || status === "ARCHIVED";
  const hasProcessed = status === "PROCESSED" || status === "ARCHIVED";
  const hasArchived = status === "ARCHIVED";

  const cameraLabel = roll.camera_nickname ||
    (roll.camera_brand && roll.camera_model ? `${roll.camera_brand} ${roll.camera_model}` : "Not set");

  const filmLabel = roll.film_nickname ||
    (roll.film_brand && roll.film_name ? `${roll.film_brand} ${roll.film_name}` : "Not set");

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 overflow-y-auto"
        style={{
          backgroundColor: "var(--bg)",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          border: `1px solid var(--border)`,
          borderBottom: "none",
          maxHeight: "70vh",
          paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-4">
          <div
            style={{
              width: 40,
              height: 3,
              backgroundColor: "#333",
              borderRadius: 2,
            }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div></div>
          <div className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            {roll.roll_number}
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold"
            style={{ color: "var(--accent)" }}
          >
            DONE
          </button>
        </div>

        {/* Fields */}
        <div className="px-6 py-4 space-y-4">
          {/* Camera & Film */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
              Camera & Film
            </label>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
              {cameraLabel !== "Not set" && filmLabel !== "Not set"
                ? `${cameraLabel} • ${filmLabel}`
                : cameraLabel !== "Not set"
                  ? cameraLabel
                  : filmLabel !== "Not set"
                    ? filmLabel
                    : "—"}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
              Status
            </label>
            <div className="text-[10px] uppercase" style={{ color: "var(--text-tertiary)" }}>
              {status}
              {roll.shot_at && ` • ${new Date(roll.shot_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
              Timeline
            </label>
            <div className="space-y-1.5">
              {isLoaded && roll.fridge_at && (
                <div className="text-[10px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                  FRIDGE • {new Date(roll.fridge_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </div>
              )}
              {hasLab && roll.lab_at && (
                <div className="text-[10px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                  LAB • {new Date(roll.lab_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </div>
              )}
              {hasScanned && roll.scanned_at && (
                <div className="text-[10px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                  SCANNED • {new Date(roll.scanned_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </div>
              )}
              {hasProcessed && roll.processed_at && (
                <div className="text-[10px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                  PROCESSED • {new Date(roll.processed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </div>
              )}
              {hasArchived && roll.archived_at && (
                <div className="text-[10px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                  ARCHIVED • {new Date(roll.archived_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {(status === "LOADED" || status === "FRIDGE") && onMoveToNext && (
            <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="text-[9px] uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
                Quick Actions
              </div>
              {status === "LOADED" && (
                <button
                  onClick={async () => { await onMoveToNext(); onClose(); }}
                  className="w-full py-3 text-[10px] font-semibold border rounded-md"
                  style={{
                    color: "var(--accent)",
                    borderColor: "var(--accent)",
                    backgroundColor: "transparent",
                  }}
                >
                  MOVE TO FRIDGE
                </button>
              )}
              {status === "FRIDGE" && (
                <button
                  onClick={async () => { await onMoveToNext(); onClose(); }}
                  className="w-full py-3 text-[10px] font-semibold border rounded-md"
                  style={{
                    color: "var(--accent)",
                    borderColor: "var(--accent)",
                    backgroundColor: "transparent",
                  }}
                >
                  SEND TO LAB
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
