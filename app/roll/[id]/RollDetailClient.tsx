"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RollDetailView } from "./RollDetailView";
import { RollEditSheet } from "@/components/RollEditSheet";
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

export default function RollDetailClient({ roll, contactSheetUrl }: RollDetailClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleSave = async (updates: Partial<Roll>) => {
    const res = await fetch(`/api/rolls/${roll.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      throw new Error("Failed to update roll");
    }

    router.refresh();
  };

  return (
    <>
      <RollDetailView
        roll={roll}
        contactSheetUrl={contactSheetUrl}
        onEdit={() => setIsEditing(true)}
      />

      {isEditing && (
        <RollEditSheet
          roll={roll}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
