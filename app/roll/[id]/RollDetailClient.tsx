"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { RollDetailView } from "./RollDetailView";
import RollEditForm from "@/components/RollEditForm";
import { rollStatus } from "@/lib/status";
import type { Roll, Camera, Film, CatalogFilm } from "@/lib/db";

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
  const [isEditingFull, setIsEditingFull] = useState(false);
  const [notes, setNotes] = useState(roll.notes || "");
  const router = useRouter();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync notes state with roll prop when it changes (e.g., after refresh)
  useEffect(() => {
    setNotes(roll.notes || "");
  }, [roll.notes]);

  const handleDelete = async () => {
    const res = await fetch(`/api/rolls/${roll.uuid}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete roll");
    router.push("/");
  };

  const handleSave = async (updates: Partial<Roll>) => {
    try {
      const res = await fetch(`/api/rolls/${roll.uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        throw new Error("Failed to update roll");
      }

      router.refresh();
    } catch {
      // Request failed — surface nothing, changes lost
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
      fetch(`/api/rolls/${roll.uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: newNotes }),
      }).catch(() => {});
    }, 1000);
  };

  const handleMoveToNext = async (labName?: string) => {
    const status = rollStatus(roll);
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

  return (
    <>
      <RollDetailView
        roll={roll}
        contactSheetUrl={contactSheetUrl}
        onEdit={() => setIsEditingFull(true)}
        onMoveToNext={handleMoveToNext}
        notes={notes}
        onNotesChange={handleNotesChange}
      />

      {isEditingFull && (
        <RollEditForm
          roll={roll}
          cameras={cameras}
          films={films}
          catalogFilms={catalogFilms}
          onClose={() => setIsEditingFull(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
