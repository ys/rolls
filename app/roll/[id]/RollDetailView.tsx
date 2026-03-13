"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  PencilSimple,
  NotePencil,
  DotsThree,
} from "@phosphor-icons/react";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { MarkdownPreview } from "@/components/MarkdownPreview";
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
  onEditNotes?: () => void;
  onMoveToNext?: (labName?: string) => void;
  notes?: string;
  onNotesChange?: (notes: string) => void;
}

function cameraLabel(roll: RollDetailViewProps["roll"]): string {
  if (roll.camera_nickname) return roll.camera_nickname;
  if (roll.camera_brand && roll.camera_model)
    return `${roll.camera_brand} ${roll.camera_model}`;
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

export function RollDetailView({
  roll,
  contactSheetUrl,
  onEdit,
  onEditNotes,
  onMoveToNext,
  notes,
  onNotesChange,
}: RollDetailViewProps) {
  const [showMenu, setShowMenu] = useState(false);
  const status = rollStatus(roll);
  const cam = cameraLabel(roll);
  const film = filmLabel(roll);

  const [dateField, dateLabel] = roll.archived_at
    ? [roll.archived_at, "Archived"]
    : roll.processed_at
      ? [roll.processed_at, "Processed"]
      : roll.scanned_at
        ? [roll.scanned_at, "Scanned"]
        : roll.lab_at
          ? [roll.lab_at, "Lab"]
          : roll.fridge_at
            ? [roll.fridge_at, "Fridge"]
            : roll.shot_at
              ? [roll.shot_at, "Loaded"]
              : [null, "Date"];

  const dateStr = dateField
    ? new Date(dateField).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  // For LOADED, FRIDGE, or LAB status: show large notes editor
  const showLargeEditor =
    status === "LOADED" || status === "FRIDGE" || status === "LAB";

  const handleEditRoll = () => {
    setShowMenu(false);
    onEdit();
  };

  const handleMoveToNext = (requiresLabName: boolean) => {
    setShowMenu(false);
    if (requiresLabName) {
      const labName = window.prompt("Enter lab name:");
      if (labName) {
        onMoveToNext?.(labName);
      }
    } else {
      onMoveToNext?.();
    }
  };

  if (showLargeEditor) {
    return createPortal(
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{
          backgroundColor: "var(--darkroom-bg)",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-4 border-b"
          style={{ borderColor: "var(--darkroom-border)" }}
        >
          <BackButton />
          <div className="flex-1 min-w-0">
            <div
              className="font-semibold text-sm"
              style={{ color: "var(--darkroom-text-primary)" }}
            >
              {roll.roll_number}
            </div>
            <div
              className="text-[9px] uppercase tracking-wide mt-0.5"
              style={{ color: "var(--darkroom-text-tertiary)" }}
            >
              {cam && film ? `${cam} • ${film}` : cam || film || "—"}
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 active:scale-90 transition-transform"
              aria-label="Actions"
            >
              <DotsThree
                size={18}
                weight="bold"
                style={{ color: "var(--darkroom-accent)" }}
              />
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
                    backgroundColor: "var(--darkroom-card)",
                    borderColor: "var(--darkroom-border)",
                    borderRadius: 8,
                    minWidth: 160,
                  }}
                >
                  <button
                    onClick={handleEditRoll}
                    className="w-full px-4 py-2 text-left text-xs active:opacity-60"
                    style={{ color: "var(--darkroom-text-primary)" }}
                  >
                    Edit Roll
                  </button>
                  {status === "LOADED" && (
                    <button
                      onClick={() => handleMoveToNext(false)}
                      className="w-full px-4 py-2 text-left text-xs active:opacity-60"
                      style={{ color: "var(--darkroom-text-primary)" }}
                    >
                      Move to Fridge
                    </button>
                  )}
                  {status === "FRIDGE" && (
                    <button
                      onClick={() => handleMoveToNext(true)}
                      className="w-full px-4 py-2 text-left text-xs active:opacity-60"
                      style={{ color: "var(--darkroom-text-primary)" }}
                    >
                      Send to Lab
                    </button>
                  )}
                  {status === "LAB" && (
                    <button
                      onClick={() => handleMoveToNext(false)}
                      className="w-full px-4 py-2 text-left text-xs active:opacity-60"
                      style={{ color: "var(--darkroom-text-primary)" }}
                    >
                      Mark as Scanned
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Large Notes Editor */}
        <div className="flex-1 px-4 py-6 flex flex-col overflow-hidden">
          <MarkdownEditor
            value={notes ?? roll.notes ?? ""}
            onChange={(v) => onNotesChange?.(v)}
            placeholder={`Notes for ${roll.roll_number}...\n\n${status === "LOADED" ? "Roll loaded in camera" : status === "FRIDGE" ? "Roll in fridge" : "Roll at the lab"}`}
            className="text-sm bg-transparent"
            style={{
              color: "var(--darkroom-text-primary)",
              fontFamily: "inherit",
              lineHeight: "1.6",
            }}
            showToolbar={false}
          />
        </div>

        {/* Status Bar */}
        <div
          className="flex gap-6 px-4 py-3 border-t"
          style={{ borderColor: "var(--darkroom-border)" }}
        >
          <div className="flex-1">
            <div
              className="text-[8px] uppercase tracking-wider mb-1"
              style={{ color: "var(--darkroom-text-tertiary)" }}
            >
              Status
            </div>
            <div
              className="text-[10px] font-medium"
              style={{
                color:
                  status === "LOADED"
                    ? "#fbbf24"
                    : status === "FRIDGE"
                      ? "#22d3ee"
                      : "#fb923c",
              }}
            >
              {status}
            </div>
          </div>
          <div className="flex-1">
            <div
              className="text-[8px] uppercase tracking-wider mb-1"
              style={{ color: "var(--darkroom-text-tertiary)" }}
            >
              {dateLabel}
            </div>
            <div
              className="text-[10px]"
              style={{ color: "var(--darkroom-text-primary)" }}
            >
              {dateStr || "—"}
            </div>
          </div>
          {roll.push_pull != null && (
            <div className="flex-1">
              <div
                className="text-[8px] uppercase tracking-wider mb-1"
                style={{ color: "var(--darkroom-text-tertiary)" }}
              >
                Push/Pull
              </div>
              <div
                className="text-[10px] font-mono"
                style={{ color: "var(--darkroom-text-primary)" }}
              >
                {roll.push_pull > 0 ? "+" : ""}
                {roll.push_pull}
              </div>
            </div>
          )}
        </div>
      </div>,
      document.body,
    );
  }

  // For SCANNED and beyond: show contact sheet and metadata
  return (
    <div
      className="flex flex-col pb-24"
      style={{ backgroundColor: "var(--darkroom-bg)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-4 border-b"
        style={{ borderColor: "var(--darkroom-border)" }}
      >
        <BackButton />
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold text-sm"
            style={{ color: "var(--darkroom-text-primary)" }}
          >
            {roll.roll_number}
          </div>
          <div
            className="text-[9px] uppercase tracking-wide mt-0.5"
            style={{ color: "var(--darkroom-text-tertiary)" }}
          >
            {cam && film ? `${cam} • ${film}` : cam || film || "—"}
          </div>
        </div>
        <button
          onClick={onEdit}
          className="p-2 active:scale-90 transition-transform"
          aria-label="Edit roll"
        >
          <PencilSimple
            size={18}
            weight="regular"
            style={{ color: "var(--darkroom-accent)" }}
          />
        </button>
      </div>

      {/* Contact Sheet */}
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
            style={{
              backgroundColor: "var(--darkroom-card)",
              borderRadius: 8,
              border: `1px solid var(--darkroom-border-subtle)`,
            }}
          >
            <Camera size={48} weight="thin" style={{ color: "#333" }} />
            <div
              className="mt-4 text-xs font-medium tracking-wide"
              style={{ color: "var(--darkroom-text-tertiary)" }}
            >
              NO CONTACT SHEET YET
            </div>
            <div
              className="mt-1 text-[9px]"
              style={{ color: "var(--darkroom-text-disabled)" }}
            >
              Upload via CLI or API
            </div>
          </div>
        )}
      </div>

      {/* Metadata Strip */}
      <div
        className="flex gap-6 px-4 py-3 border-t"
        style={{ borderColor: "var(--darkroom-border)" }}
      >
        <div className="flex-1">
          <div
            className="text-[8px] uppercase tracking-wider mb-1"
            style={{ color: "var(--darkroom-text-tertiary)" }}
          >
            Status
          </div>
          <div
            className="text-[10px]"
            style={{ color: "var(--darkroom-text-primary)" }}
          >
            {status}
          </div>
        </div>
        <div className="flex-1">
          <div
            className="text-[8px] uppercase tracking-wider mb-1"
            style={{ color: "var(--darkroom-text-tertiary)" }}
          >
            Date
          </div>
          <div
            className="text-[10px]"
            style={{ color: "var(--darkroom-text-primary)" }}
          >
            {dateStr || "—"}
          </div>
        </div>
        {roll.push_pull != null && (
          <div className="flex-1">
            <div
              className="text-[8px] uppercase tracking-wider mb-1"
              style={{ color: "var(--darkroom-text-tertiary)" }}
            >
              Push/Pull
            </div>
            <div
              className="text-[10px] font-mono"
              style={{ color: "var(--darkroom-text-primary)" }}
            >
              {roll.push_pull > 0 ? "+" : ""}
              {roll.push_pull}
            </div>
          </div>
        )}
        <button
          onClick={onEditNotes}
          className="flex-[2] min-w-0 text-left active:opacity-60 transition-opacity"
        >
          <div className="flex items-center gap-1 mb-1">
            <div
              className="text-[8px] uppercase tracking-wider"
              style={{ color: "var(--darkroom-text-tertiary)" }}
            >
              Notes
            </div>
            <NotePencil
              size={10}
              weight="bold"
              style={{ color: "var(--darkroom-text-tertiary)" }}
            />
          </div>
          <div className="text-[10px] italic truncate line-clamp-2">
            {roll.notes ? (
              <MarkdownPreview content={roll.notes} />
            ) : (
              <span style={{ color: "var(--darkroom-text-disabled)" }}>
                Tap to add notes...
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
