"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Sheet({
  open,
  onClose,
  onExpand,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onExpand?: (expanded: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const dragOffsetRef = useRef(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    if (open) {
      document.body.style.overflow = "hidden";
      sheet.style.transition = "transform 300ms ease-out";
      sheet.style.transform = "translateY(0)";
    } else {
      document.body.style.overflow = "";
      setExpanded(false);
      sheet.style.transition = "transform 300ms ease-out";
      sheet.style.transform = "translateY(100%)";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    startYRef.current = e.clientY;
    dragOffsetRef.current = 0;
    isDraggingRef.current = true;
    const sheet = sheetRef.current;
    if (sheet) sheet.style.transition = "none";
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;
    const delta = e.clientY - startYRef.current;
    const offset = delta > 0 ? delta : delta * 0.3;
    dragOffsetRef.current = offset;
    const sheet = sheetRef.current;
    if (sheet) sheet.style.transform = `translateY(${offset}px)`;
  }

  function onPointerUp() {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const offset = dragOffsetRef.current;
    dragOffsetRef.current = 0;
    const sheet = sheetRef.current;
    if (sheet) sheet.style.transition = "transform 300ms ease-out";

    if (offset > 80) {
      onClose();
    } else if (offset < -20) {
      setExpanded(true);
      onExpand?.(true);
      if (sheet) sheet.style.transform = "translateY(0)";
    } else {
      if (sheet) sheet.style.transform = "translateY(0)";
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-all duration-300 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative w-full max-w-lg rounded-t-3xl shadow-2xl"
        style={{
          transform: "translateY(100%)",
          paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
          backgroundColor: "var(--darkroom-bg)",
        }}
      >
        {/* Handle — drag target */}
        <div
          className="py-3 flex justify-center cursor-grab active:cursor-grabbing touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "var(--darkroom-border)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2">
          <div className="w-8" />
          <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--darkroom-text-primary)" }}>{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-xl leading-none transition-opacity active:opacity-50"
            style={{ color: "var(--darkroom-text-secondary)" }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div
          className="px-4 pt-4 pb-2 overflow-y-auto transition-[max-height] duration-300"
          style={{ maxHeight: expanded ? "90vh" : "75vh" }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
