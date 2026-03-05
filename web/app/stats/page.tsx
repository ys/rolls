import { sql } from "@/lib/db";
import StatsClient from "./StatsClient";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const [rollsPerYear, topCameras, topFilms, statusCounts] = await Promise.all([
    // Rolls per year derived from roll_number prefix (e.g. 25x01 → 2025)
    sql<{ year: string; count: number }[]>`
      SELECT
        '20' || SUBSTRING(roll_number, 1, 2) AS year,
        COUNT(*)::int AS count
      FROM rolls
      WHERE roll_number ~ '^[0-9]{2}x'
      GROUP BY 1
      ORDER BY 1 DESC
    `,

    sql<{ camera_id: string; count: number }[]>`
      SELECT camera_id, COUNT(*)::int AS count
      FROM rolls
      WHERE camera_id IS NOT NULL
      GROUP BY camera_id
      ORDER BY count DESC
      LIMIT 10
    `,

    sql<{ film_id: string; count: number }[]>`
      SELECT film_id, COUNT(*)::int AS count
      FROM rolls
      WHERE film_id IS NOT NULL
      GROUP BY film_id
      ORDER BY count DESC
      LIMIT 10
    `,

    sql<{ status: string; count: number }[]>`
      SELECT
        CASE
          WHEN archived_at  IS NOT NULL THEN 'ARCHIVED'
          WHEN uploaded_at  IS NOT NULL THEN 'UPLOADED'
          WHEN processed_at IS NOT NULL THEN 'PROCESSED'
          WHEN scanned_at   IS NOT NULL THEN 'SCANNED'
          WHEN lab_at       IS NOT NULL THEN 'LAB'
          WHEN fridge_at    IS NOT NULL THEN 'FRIDGE'
          ELSE 'LOADED'
        END AS status,
        COUNT(*)::int AS count
      FROM rolls
      GROUP BY 1
    `,
  ]);

  return (
    <StatsClient
      initialData={{
        rollsPerYear: rollsPerYear as { year: string; count: number }[],
        topCameras: topCameras as { camera_id: string; count: number }[],
        topFilms: topFilms as { film_id: string; count: number }[],
        statusCounts: statusCounts as { status: string; count: number }[],
      }}
    />
  );
}
