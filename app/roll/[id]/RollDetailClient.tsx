"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { RollDetailView } from "./RollDetailView";
import RollEditForm from "@/components/RollEditForm";
import { rollStatus } from "@/lib/status";
import type { Roll, Camera, Film, CatalogFilm } from "@/lib/db";
import { db } from "@/lib/offline-db";
import { mergeRollUpdate, registerBackgroundSync } from "@/lib/sync-queue";
import { invalidateCache } from "@/lib/cache";

interface RollDetailClientProps {
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
  cameras: Camera[];
  films: Film[];
  catalogFilms: CatalogFilm[];
}

export default function RollDetailClient({ roll, contactSheetUrl, cameras, films, catalogFilms }: RollDetailClientProps) {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const [isEditingFull, setIsEditingFull] = useState(false);
  const [notes, setNotes] = useState(roll.notes || "");
  // Local pending updates applied offline, overlaid on server-fetched roll props
  const [pendingUpdates, setPendingUpdates] = useState<Partial<Roll>>({});
  const router = useRouter();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync notes state with roll prop when it changes (e.g., after refresh)
  useEffect(() => {
    setNotes(roll.notes || "");
  }, [roll.notes]);

  // Listen for SW sync success to clear pending state and refresh
  useEffect(() => {
    function handleSwMessage(event: MessageEvent) {
      if (event.data?.type === "SYNC_SUCCESS" && event.data.rollNumber === roll.roll_number) {
        setPendingUpdates({});
        invalidateCache("rolls");
        router.refresh();
      }
    }
    navigator.serviceWorker?.addEventListener("message", handleSwMessage);
    return () => navigator.serviceWorker?.removeEventListener("message", handleSwMessage);
  }, [roll.roll_number, router]);

  const handleSave = async (updates: Partial<Roll>) => {
    if (!navigator.onLine) {
      setPendingUpdates((prev) => ({ ...prev, ...updates }));
      await db.rolls.where("roll_number").equals(roll.roll_number).modify(updates);
      await mergeRollUpdate(roll.roll_number, updates, apiKey);
      await registerBackgroundSync();
      return;
    }
    try {
      const res = await fetch(`/api/rolls/${roll.roll_number}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        throw new Error("Failed to update roll");
      }

      router.refresh();
    } catch {
      // Online but request failed — surface nothing, changes lost
    }
  };

  const handleSaveNotes = async (notes: string) => {
    await handleSave({ notes });
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save by 1 second
    saveTimeoutRef.current = setTimeout(async () => {
      if (!navigator.onLine) {
        setPendingUpdates((prev) => ({ ...prev, notes: newNotes }));
        await db.rolls.where("roll_number").equals(roll.roll_number).modify({ notes: newNotes });
        await mergeRollUpdate(roll.roll_number, { notes: newNotes }, apiKey);
        await registerBackgroundSync();
        return;
      }
      fetch(`/api/rolls/${roll.roll_number}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: newNotes }),
      }).catch(() => {});
    }, 1000);
  };

  const handleMoveToNext = async (labName?: string) => {
    const status = rollStatus({ ...roll, ...pendingUpdates });
    const updates: Partial<Roll> = {};

    if (status === "LOADED") {
      updates.fridge_at = new Date().toISOString();
    } else if (status === "FRIDGE") {
      updates.lab_at = new Date().toISOString();
      if (labName) updates.lab_name = labName;
    } else if (status === "LAB") {
      updates.scanned_at = new Date().toISOString();
    }

    await handleSave(updates);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Merge pending offline updates onto the server-fetched roll for display
  const displayRoll = { ...roll, ...pendingUpdates };

  return (
    <>
      <RollDetailView
        roll={displayRoll}
        contactSheetUrl={contactSheetUrl}
        onEdit={() => setIsEditingFull(true)}
        onMoveToNext={handleMoveToNext}
        notes={notes}
        onNotesChange={handleNotesChange}
      />

      {isEditingFull && (
        <RollEditForm
          roll={displayRoll}
          cameras={cameras}
          films={films}
          catalogFilms={catalogFilms}
          onClose={() => setIsEditingFull(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
