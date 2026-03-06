import { sql } from "@/lib/db";
import type { Film } from "@/lib/db";
import FilmsClient from "./FilmsClient";

export const dynamic = "force-dynamic";

export default async function FilmsPage() {
  const films = await sql<Film[]>`
    SELECT f.*, COUNT(r.roll_number)::int AS roll_count
    FROM films f
    LEFT JOIN rolls r ON r.film_id = f.id
    GROUP BY f.id
    ORDER BY COALESCE(f.nickname, f.brand || ' ' || f.name)
  `;

  return <FilmsClient initialFilms={films} />;
}
