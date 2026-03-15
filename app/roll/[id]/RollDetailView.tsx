"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
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

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function RollDetailView({
  roll,
  contactSheetUrl,
  onEdit,
  onMoveToNext,
  notes,
  onNotesChange,
}: RollDetailViewProps) {
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [pendingLab, setPendingLab] = useState(false);
  const [labNameInput, setLabNameInput] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const status = rollStatus(roll);
  const cam = cameraLabel(roll);
  const film = filmLabel(roll);

  const pushPullStr =
    roll.push_pull != null
      ? `${roll.push_pull > 0 ? "+" : ""}${roll.push_pull}`
      : null;

  // Subtitle: camera · film · push/pull
  const subtitle = [cam && film ? `${cam} · ${film}` : cam || film, pushPullStr]
    .filter(Boolean)
    .join(" · ");

  const showLargeEditor =
    status === "LOADED" || status === "FRIDGE" || status === "LAB";

  // Status band colours
  const bandBg =
    status === "LOADED"
      ? "var(--status-loaded-bg)"
      : status === "FRIDGE"
        ? "var(--status-fridge-bg)"
        : "var(--status-lab-bg)";
  const bandText =
    status === "LOADED"
      ? "var(--status-loaded-text)"
      : status === "FRIDGE"
        ? "var(--status-fridge-text)"
        : "var(--status-lab-text)";

  // Text shown on the right side of the status band
  const bandInfo =
    status === "LOADED"
      ? roll.shot_at
        ? fmtDate(roll.shot_at)
        : ""
      : status === "FRIDGE"
        ? [roll.fridge_at ? fmtDate(roll.fridge_at) : "", pushPullStr]
            .filter(Boolean)
            .join(" · ")
        : roll.lab_name || (roll.lab_at ? fmtDate(roll.lab_at) : "");

  const closeSheet = () => {
    setShowActionSheet(false);
    setPendingLab(false);
    setLabNameInput("");
  };

  const confirmLab = () => {
    closeSheet();
    onMoveToNext?.(labNameInput || undefined);
  };

  // ── NOTEBOOK VIEW (LOADED / FRIDGE / LAB) ─────────────────────────
  if (showLargeEditor) {
    return createPortal(
      <div
        className="fixed inset-x-0 top-0 h-dvh z-50 flex flex-col"
        style={{
          backgroundColor: "var(--bg)",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {/* Back bar */}
        <div className="flex items-center px-5 py-4">
          <BackButton />
        </div>

        {/* Header */}
        <div
          className="px-5 pb-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1,
              fontFamily: "inherit",
            }}
          >
            {roll.roll_number}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
                marginTop: 4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Notes area — dot grid texture, amber caret */}
        <div className="flex-1 relative overflow-hidden">
          <textarea
            value={notes ?? roll.notes ?? ""}
            onChange={(e) => onNotesChange?.(e.target.value)}
            placeholder="Notes…"
            className="dot-grid absolute inset-0 w-full h-full resize-none border-none outline-none"
            style={{
              padding: "16px 20px",
              fontSize: 15,
              lineHeight: 1.75,
              color: "var(--text-primary)",
              caretColor: "var(--accent)",
              fontFamily: "inherit",
              backgroundColor: "transparent",
            }}
          />
        </div>

        {/* Status band + pull-up handle — unified tap target */}
        <button
          onClick={() => setShowActionSheet(true)}
          aria-label="Open actions"
          style={{
            flexShrink: 0,
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "block",
            width: "100%",
            textAlign: "left",
          }}
        >
          {/* Status band */}
          <div
            style={{
              backgroundColor: bandBg,
              color: bandText,
              padding: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              {status}
            </span>
            {bandInfo && (
              <span
                style={{ fontSize: 11, letterSpacing: "0.08em", opacity: 0.85 }}
              >
                {bandInfo}
              </span>
            )}
          </div>

          {/* Pull-up handle */}
          <div
            style={{
              backgroundColor: "var(--sheet-bg)",
              padding: "10px 0",
              paddingBottom: "calc(10px + env(safe-area-inset-bottom))",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 36,
                height: 3,
                background: "#4a3d38",
                borderRadius: 2,
              }}
            />
          </div>
        </button>

        {/* Action sheet overlay */}
        {showActionSheet && (
          <>
            <div
              className="absolute inset-0"
              style={{ background: "rgba(26,20,16,0.35)" }}
              onClick={closeSheet}
            />
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                background: "var(--sheet-bg)",
                borderRadius: "24px 24px 0 0",
                paddingBottom: "env(safe-area-inset-bottom)",
              }}
            >
              {/* Drag handle */}
              <div
                className="flex justify-center"
                style={{ padding: "12px 0 0" }}
              >
                <div
                  style={{
                    width: 36,
                    height: 3,
                    background: "#4a3d38",
                    borderRadius: 2,
                  }}
                />
              </div>

              {/* Identity header */}
              <div
                style={{
                  padding: "14px 24px 12px",
                  borderBottom: "1px solid var(--sheet-border)",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#6b5a52",
                  }}
                >
                  {roll.roll_number} · {status}
                </div>
              </div>

              {/* Lab name input (shown when pendingLab) */}
              {pendingLab ? (
                <div style={{ padding: "16px 24px" }}>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#6b5a52",
                      marginBottom: 10,
                    }}
                  >
                    Lab Name
                  </div>
                  <input
                    type="text"
                    value={labNameInput}
                    onChange={(e) => setLabNameInput(e.target.value)}
                    placeholder="e.g. Beau Photo"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && confirmLab()}
                    style={{
                      width: "100%",
                      background: "#3d3530",
                      border: "1px solid var(--sheet-border)",
                      color: "var(--sheet-text)",
                      padding: "10px 14px",
                      fontSize: 17,
                      fontFamily: "inherit",
                      outline: "none",
                      caretColor: "var(--accent)",
                      marginBottom: 12,
                    }}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={confirmLab}
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "var(--accent)",
                        color: "#1a1a1a",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        fontFamily: "inherit",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Send to Lab
                    </button>
                    <button
                      onClick={() => setPendingLab(false)}
                      style={{
                        padding: "12px 16px",
                        background: "transparent",
                        color: "#4a3d38",
                        fontSize: 11,
                        fontFamily: "inherit",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "6px 0" }}>
                  {/* Single next-step action */}
                  {status === "LOADED" && (
                    <button
                      onClick={() => {
                        closeSheet();
                        onMoveToNext?.();
                      }}
                      style={sheetRowStyle}
                    >
                      <span>Move to Fridge</span>
                      <span style={{ color: "var(--accent)" }}>›</span>
                    </button>
                  )}
                  {status === "FRIDGE" && (
                    <button
                      onClick={() => setPendingLab(true)}
                      style={sheetRowStyle}
                    >
                      <span>Send to Lab</span>
                      <span style={{ color: "var(--accent)" }}>›</span>
                    </button>
                  )}
                  {status === "LAB" && (
                    <button
                      onClick={() => {
                        closeSheet();
                        onMoveToNext?.();
                      }}
                      style={sheetRowStyle}
                    >
                      <span>Mark as Scanned</span>
                      <span style={{ color: "var(--accent)" }}>›</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      closeSheet();
                      onEdit();
                    }}
                    style={sheetRowStyle}
                  >
                    <span>Edit Roll</span>
                  </button>
                  <div
                    style={{
                      height: 1,
                      background: "var(--sheet-border)",
                      margin: "4px 0",
                    }}
                  />
                  <button
                    onClick={closeSheet}
                    style={{
                      ...sheetRowStyle,
                      color: "#4a3d38",
                      borderBottom: "none",
                    }}
                  >
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>,
      document.body,
    );
  }

  // ── ARCHIVED ROLL VIEW (SCANNED / PROCESSED / UPLOADED / ARCHIVED) ─

  // Notes full-screen editor portal
  if (isEditingNotes) {
    return createPortal(
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--bg)",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {/* Header bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setIsEditingNotes(false)}
            style={{
              fontSize: 24,
              color: "var(--text-primary)",
              background: "none",
              border: "none",
              cursor: "pointer",
              lineHeight: 1,
              padding: "0 12px 0 0",
              fontFamily: "inherit",
            }}
          >
            ‹
          </button>
          <span
            style={{
              fontWeight: 700,
              color: "var(--text-primary)",
              fontSize: 17,
            }}
          >
            {roll.roll_number}
          </span>
        </div>
        {/* Full-screen dot-grid textarea */}
        <textarea
          value={notes ?? roll.notes ?? ""}
          onChange={(e) => onNotesChange?.(e.target.value)}
          className="dot-grid"
          style={{
            flex: 1,
            padding: "16px 20px",
            fontSize: 15,
            lineHeight: 1.75,
            color: "var(--text-primary)",
            caretColor: "var(--accent)",
            fontFamily: "inherit",
            border: "none",
            outline: "none",
            resize: "none",
            width: "100%",
            height: "100%",
            backgroundColor: "transparent",
          }}
        />
      </div>,
      document.body,
    );
  }

  const timelineEvents = [
    ["Shot", roll.shot_at],
    ["Fridge", roll.fridge_at],
    ["Lab", roll.lab_at, roll.lab_name],
    ["Scanned", roll.scanned_at],
    ["Processed", roll.processed_at],
    ["Archived", roll.archived_at],
  ].filter(([, d]) => d) as [string, string, string?][];

  return (
    <div
      className="flex flex-col pb-24"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Header: back + roll number + Edit */}
      <div
        className="flex items-start justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <BackButton />
        <div className="flex-1 px-3">
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.1,
            }}
          >
            {roll.roll_number}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
                marginTop: 3,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        <button
          onClick={onEdit}
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--accent)",
            background: "none",
            border: "none",
            cursor: "pointer",
            paddingTop: 2,
          }}
        >
          Edit
        </button>
      </div>

      {/* Contact sheet — full width, no radius, dark bg */}
      {contactSheetUrl ? (
        <img
          src={contactSheetUrl}
          alt={`Contact sheet for roll ${roll.roll_number}`}
          className="w-full h-auto"
          style={{ display: "block", borderRadius: 0 }}
        />
      ) : (
        <div
          className="w-full flex flex-col items-center justify-center gap-3"
          style={{
            aspectRatio: "3/2",
            background: "#faf8f4",
            border: "1px dashed #c8c2b6",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 3,
              opacity: 0.35,
            }}
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 22,
                  height: 16,
                  border: "1px solid #999",
                }}
              />
            ))}
          </div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--text-disabled)",
            }}
          >
            No Contact Sheet
          </div>
          <div
            style={{
              fontSize: 10,
              color: "var(--text-disabled)",
              letterSpacing: "0.06em",
            }}
          >
            Upload via CLI
          </div>
        </div>
      )}

      {/* Timeline */}
      {timelineEvents.length > 0 && (
        <div className="px-5 pt-5 pb-2">
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
              marginBottom: 14,
            }}
          >
            Timeline
          </div>
          <div className="flex flex-col">
            {timelineEvents.map(([label, d, extra], i) => (
              <div key={label} className="flex items-start gap-3">
                <div
                  className="flex flex-col items-center flex-shrink-0"
                  style={{ width: 12 }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "var(--accent)",
                      marginTop: 4,
                      flexShrink: 0,
                    }}
                  />
                  {i < timelineEvents.length - 1 && (
                    <div
                      style={{
                        width: 1,
                        minHeight: 28,
                        backgroundColor: "var(--border)",
                        margin: "3px 0",
                      }}
                    />
                  )}
                </div>
                <div
                  style={{
                    paddingBottom: i < timelineEvents.length - 1 ? 0 : 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {label}
                    {extra ? ` · ${extra}` : ""}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: "var(--text-primary)",
                      marginTop: 2,
                      marginBottom: i < timelineEvents.length - 1 ? 16 : 0,
                    }}
                  >
                    {fmtDate(d)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes — always shown, tappable to open full-screen editor */}
      <div
        onClick={() => setIsEditingNotes(true)}
        style={{ cursor: "pointer" }}
      >
        <div
          className="px-5 py-5 border-t"
          style={{ borderColor: "var(--border)", marginTop: 8 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
              }}
            >
              Notes
            </div>
            <span
              style={{
                fontSize: 11,
                color: "var(--text-disabled)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Edit
            </span>
          </div>
          {(notes ?? roll.notes) ? (
            <div
              style={{
                fontSize: 15,
                color: "var(--text-primary)",
                lineHeight: 1.75,
              }}
            >
              {notes ?? roll.notes}
            </div>
          ) : (
            <div
              style={{
                fontSize: 15,
                color: "var(--text-disabled)",
                lineHeight: 1.75,
                fontStyle: "italic",
              }}
            >
              Tap to add notes…
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {roll.tags && roll.tags.length > 0 && (
        <div
          className="px-5 py-5 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
              marginBottom: 10,
            }}
          >
            Tags
          </div>
          <div className="flex flex-wrap gap-2">
            {roll.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 13,
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                  padding: "3px 10px",
                  letterSpacing: "0.04em",
                  fontFamily: "inherit",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const sheetRowStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 24px",
  background: "none",
  borderTop: "none",
  borderLeft: "none",
  borderRight: "none",
  borderBottom: "1px solid var(--sheet-border)",
  color: "var(--sheet-text)",
  fontSize: 17,
  fontFamily: "inherit",
  textAlign: "left",
  cursor: "pointer",
};
