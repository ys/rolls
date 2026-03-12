"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { CaretRight, Clock } from "@phosphor-icons/react";
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
}

export function RollEditSheet({ roll, onClose, onSave }: RollEditSheetProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    notes: roll.notes || "",
  });

  const status = rollStatus(roll);
  const isLoaded = status === "LOADED" || status === "FRIDGE";
  const hasLab = status !== "LOADED" && status !== "FRIDGE";
  const hasScanned = status === "SCANNED" || status === "PROCESSED" || status === "ARCHIVED";
  const hasProcessed = status === "PROCESSED" || status === "ARCHIVED";
  const hasArchived = status === "ARCHIVED";

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  const cameraLabel = roll.camera_nickname ||
    (roll.camera_brand && roll.camera_model ? `${roll.camera_brand} ${roll.camera_model}` : "Not set");

  const filmLabel = roll.film_nickname ||
    (roll.film_brand && roll.film_name ? `${roll.film_brand} ${roll.film_name}` : "Not set");

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

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
          backgroundColor: "var(--darkroom-card)",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          border: `1px solid var(--darkroom-border)`,
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
        <div className="flex items-center justify-between px-6 pb-4 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
          <button
            onClick={onClose}
            className="text-xs"
            style={{ color: "var(--darkroom-text-tertiary)" }}
          >
            CANCEL
          </button>
          <div className="text-[13px] font-semibold" style={{ color: "var(--darkroom-text-primary)" }}>
            EDIT ROLL {roll.roll_number}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs font-semibold"
            style={{ color: saving ? "var(--darkroom-text-tertiary)" : "var(--darkroom-accent)" }}
          >
            {saving ? "SAVING..." : "SAVE"}
          </button>
        </div>

        {/* Fields */}
        <div className="px-6 py-4 space-y-4">
          {/* Camera */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
              Camera
            </label>
            <button className="w-full flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
              <span className="text-xs" style={{ color: "var(--darkroom-text-primary)" }}>{cameraLabel}</span>
              <CaretRight size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
            </button>
          </div>

          {/* Film */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
              Film
            </label>
            <button className="w-full flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
              <span className="text-xs" style={{ color: "var(--darkroom-text-primary)" }}>{filmLabel}</span>
              <CaretRight size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
            </button>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
              Status
            </label>
            <button className="w-full flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
              <span className="text-xs" style={{ color: "var(--darkroom-text-primary)" }}>{status}</span>
              <CaretRight size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
            </button>
          </div>

          {/* Fridge Date (for LOADED/FRIDGE status) */}
          {isLoaded && (
            <div>
              <label className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
                Fridge Date
              </label>
              <button className="w-full flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
                <span className="text-xs" style={{ color: "var(--darkroom-text-primary)" }}>{formatDate(roll.fridge_at)}</span>
                <Clock size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
              </button>
            </div>
          )}

          {/* Lab Date */}
          {hasLab && (
            <div>
              <label className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
                Lab Date
              </label>
              <button className="w-full flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
                <span className="text-xs" style={{ color: roll.lab_at ? "var(--darkroom-text-primary)" : "var(--darkroom-text-tertiary)" }}>
                  {formatDate(roll.lab_at)}
                </span>
                <Clock size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
              </button>
            </div>
          )}

          {/* Scanned Date */}
          {hasScanned && (
            <div>
              <label className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
                Scanned Date
              </label>
              <button className="w-full flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
                <span className="text-xs" style={{ color: roll.scanned_at ? "var(--darkroom-text-primary)" : "var(--darkroom-text-tertiary)" }}>
                  {formatDate(roll.scanned_at)}
                </span>
                <Clock size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
              </button>
            </div>
          )}

          {/* Processed Date */}
          {hasProcessed && (
            <div>
              <label className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
                Processed Date
              </label>
              <button className="w-full flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
                <span className="text-xs" style={{ color: roll.processed_at ? "var(--darkroom-text-primary)" : "var(--darkroom-text-tertiary)" }}>
                  {formatDate(roll.processed_at)}
                </span>
                <Clock size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
              </button>
            </div>
          )}

          {/* Archived Date */}
          {hasArchived && (
            <div>
              <label className="block text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--darkroom-text-tertiary)" }}>
                Archived Date
              </label>
              <button className="w-full flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--darkroom-border)" }}>
                <span className="text-xs" style={{ color: roll.archived_at ? "var(--darkroom-text-primary)" : "var(--darkroom-text-tertiary)" }}>
                  {formatDate(roll.archived_at)}
                </span>
                <Clock size={12} style={{ color: "var(--darkroom-text-tertiary)" }} />
              </button>
            </div>
          )}

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[9px] uppercase tracking-wider" style={{ color: "var(--darkroom-text-tertiary)" }}>
                Notes
              </label>
              <button className="text-[9px] font-semibold" style={{ color: "var(--darkroom-accent)" }}>
                EXPAND
              </button>
            </div>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add notes..."
              className="w-full text-xs px-0 py-2 bg-transparent border-b resize-none outline-none"
              style={{
                color: "var(--darkroom-text-primary)",
                borderColor: "var(--darkroom-border)",
                fontFamily: "inherit",
              }}
              rows={2}
            />
          </div>

          {/* Quick Actions for Loaded/Fridge status */}
          {isLoaded && (
            <div className="pt-4 border-t" style={{ borderColor: "var(--darkroom-border)" }}>
              <div className="text-[9px] uppercase tracking-wider mb-3" style={{ color: "var(--darkroom-text-tertiary)" }}>
                Quick Actions
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 py-3 text-[10px] font-semibold border rounded-md"
                  style={{
                    color: "var(--darkroom-accent)",
                    borderColor: "var(--darkroom-accent)",
                    backgroundColor: "transparent",
                  }}
                >
                  MARK AS LAB
                </button>
                <button
                  className="flex-1 py-3 text-[10px] font-semibold border rounded-md"
                  style={{
                    color: "var(--darkroom-text-tertiary)",
                    borderColor: "var(--darkroom-text-tertiary)",
                    backgroundColor: "transparent",
                  }}
                >
                  ARCHIVE
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
