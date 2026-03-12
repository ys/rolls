"use client";

import { useState } from "react";
import { RollDetailView } from "./RollDetailView";
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

  if (isEditing) {
    // TODO: Render edit sheet in Phase 3
    return <div>Edit mode - TODO</div>;
  }

  return (
    <RollDetailView
      roll={roll}
      contactSheetUrl={contactSheetUrl}
      onEdit={() => setIsEditing(true)}
    />
  );
}
