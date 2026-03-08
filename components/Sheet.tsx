"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setExpanded(false);
      setDragOffset(0);
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    startY.current = e.clientY;
    setIsDragging(true);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    const delta = e.clientY - startY.current;
    // Resistance when dragging up past natural position
    setDragOffset(delta > 0 ? delta : delta * 0.3);
  }

  function onPointerUp() {
    setIsDragging(false);
    const offset = dragOffset;
    if (offset > 80) {
      onClose(); // dragOffset resets via the open→false effect
    } else if (offset < -20) {
      setExpanded(true);
      setDragOffset(0);
    } else {
      setDragOffset(0);
    }
  }

  const sheetTransform = !open
    ? "translateY(100%)"
    : dragOffset !== 0
      ? `translateY(${dragOffset}px)`
      : "translateY(0)";

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
        className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-t-3xl shadow-2xl"
        style={{
          transform: sheetTransform,
          transition: isDragging ? "none" : "transform 300ms ease-out",
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
          <div className="w-10 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-2">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors text-xl leading-none"
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
