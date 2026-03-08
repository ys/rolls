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
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border-t-2 border-l-2 border-r-2 border-zinc-900 dark:border-zinc-100"
        style={{
          transform: "translateY(100%)",
          paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
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
          <div className="w-10 h-0.5 bg-zinc-300 dark:bg-zinc-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-2">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div
          className="px-6 pt-4 pb-2 overflow-y-auto transition-[max-height] duration-300"
          style={{ maxHeight: expanded ? "90vh" : "75vh" }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
