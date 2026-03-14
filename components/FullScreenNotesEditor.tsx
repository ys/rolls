"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, DotsThree } from "@phosphor-icons/react";
import { haptics } from "@/lib/haptics";
import { MarkdownEditor } from "./MarkdownEditor";
import { rollStatus } from "@/lib/status";
import type { Roll } from "@/lib/db";

interface FullScreenNotesEditorProps {
  rollNumber: string;
  initialNotes: string;
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
  onClose: () => void;
  onSave: (notes: string) => Promise<void>;
  onEditRoll?: () => void;
  onMoveToNext?: (labName?: string) => Promise<void>;
}

export function FullScreenNotesEditor({
  rollNumber,
  initialNotes,
  roll,
  onClose,
  onSave,
  onEditRoll,
  onMoveToNext,
}: FullScreenNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [showMenu, setShowMenu] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced auto-save
  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      onSave(newNotes).catch(console.error);
    }, 1000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    haptics.light();
    onClose();
  };

  const handleEditRoll = () => {
    haptics.light();
    setShowMenu(false);
    onEditRoll?.();
  };

  const handleMoveToNext = async (requiresLabName: boolean) => {
    haptics.light();
    setShowMenu(false);

    if (requiresLabName) {
      const labName = window.prompt("Enter lab name:");
      if (labName) {
        await onMoveToNext?.(labName);
      }
    } else {
      await onMoveToNext?.();
    }
  };

  const status = rollStatus(roll);
  const canMoveToNext = status === "LOADED" || status === "FRIDGE" || status === "LAB";

  const [dateField, dateLabel] =
    roll.archived_at ? [roll.archived_at, "Archived"] :
    roll.processed_at ? [roll.processed_at, "Processed"] :
    roll.scanned_at ? [roll.scanned_at, "Scanned"] :
    roll.lab_at ? [roll.lab_at, "Lab"] :
    roll.fridge_at ? [roll.fridge_at, "Fridge"] :
    roll.shot_at ? [roll.shot_at, "Shot"] :
    [null, "Date"];

  const dateStr = dateField
    ? new Date(dateField).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        backgroundColor: "var(--bg)",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={handleClose}
          className="p-2 -ml-2 active:scale-90 transition-transform"
          aria-label="Close"
        >
          <X size={20} weight="bold" style={{ color: "var(--text-secondary)" }} />
        </button>
        <div className="flex-1 text-center">
          <div
            className="text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-primary)" }}
          >
            {rollNumber}
          </div>
          <div
            className="text-[9px] uppercase tracking-wider mt-0.5"
            style={{ color: "var(--text-tertiary)" }}
          >
            Notes
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 -mr-2 active:scale-90 transition-transform"
            aria-label="Actions"
          >
            <DotsThree size={20} weight="bold" style={{ color: "var(--accent)" }} />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div
                className="absolute right-0 top-full mt-2 py-1 border z-50"
                style={{
                  backgroundColor: "var(--bg)",
                  borderColor: "var(--border)",
                  borderRadius: 8,
                  minWidth: 160,
                }}
              >
                <button
                  onClick={handleEditRoll}
                  className="w-full px-4 py-2 text-left text-xs active:opacity-60"
                  style={{ color: "var(--text-primary)" }}
                >
                  Edit Roll
                </button>
                {canMoveToNext && status === "LOADED" && (
                  <button
                    onClick={() => handleMoveToNext(false)}
                    className="w-full px-4 py-2 text-left text-xs active:opacity-60"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Move to Fridge
                  </button>
                )}
                {canMoveToNext && status === "FRIDGE" && (
                  <button
                    onClick={() => handleMoveToNext(true)}
                    className="w-full px-4 py-2 text-left text-xs active:opacity-60"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Send to Lab
                  </button>
                )}
                {canMoveToNext && status === "LAB" && (
                  <button
                    onClick={() => handleMoveToNext(false)}
                    className="w-full px-4 py-2 text-left text-xs active:opacity-60"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Mark as Scanned
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col px-4 py-4 overflow-hidden">
        <MarkdownEditor
          value={notes}
          onChange={handleNotesChange}
          placeholder="Add notes about this roll..."
          className="text-sm bg-transparent"
          style={{
            color: "var(--text-primary)",
            fontFamily: "inherit",
            lineHeight: "1.6",
          }}
          showToolbar={false}
        />
      </div>

      {/* Status Bar */}
      <div className="flex gap-6 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex-1">
          <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>Status</div>
          <div
            className="text-[10px] font-medium"
            style={{
              color: status === "LOADED" ? "#fbbf24" :
                     status === "FRIDGE" ? "#22d3ee" :
                     status === "LAB" ? "#fb923c" :
                     status === "SCANNED" ? "#22c55e" :
                     status === "PROCESSED" ? "#a855f7" :
                     status === "UPLOADED" ? "#3b82f6" :
                     "var(--text-secondary)",
            }}
          >
            {status}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>{dateLabel}</div>
          <div className="text-[10px]" style={{ color: "var(--text-primary)" }}>{dateStr || "—"}</div>
        </div>
        {roll.push_pull != null && (
          <div className="flex-1">
            <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>Push/Pull</div>
            <div className="text-[10px] font-mono" style={{ color: "var(--text-primary)" }}>
              {roll.push_pull > 0 ? "+" : ""}{roll.push_pull}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
