import { sql } from "@/lib/db";
import type { Film } from "@/lib/db";
import { getUserId } from "@/lib/request-context";
import FilmsClient from "./FilmsClient";

export const dynamic = "force-dynamic";

export default async function FilmsPage() {
  const userId = await getUserId();
  const films = await sql<Film[]>`
    SELECT f.*, COUNT(r.roll_number)::int AS roll_count
    FROM films f
    LEFT JOIN rolls r ON r.film_uuid = f.uuid AND r.user_id = ${userId}
    WHERE f.user_id = ${userId}
    GROUP BY f.uuid
    ORDER BY COALESCE(f.nickname, f.brand || ' ' || f.name)
  `;

  return <FilmsClient initialFilms={films} />;
}
