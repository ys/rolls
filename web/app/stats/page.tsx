import { sql } from "@/lib/db";
import StatsClient from "./StatsClient";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const [rollsPerYear, topCameras, topFilms, statusCounts] = await Promise.all([
    sql<{ year: string; count: number }[]>`
      SELECT
        '20' || SUBSTRING(roll_number, 1, 2) AS year,
        COUNT(*)::int AS count
      FROM rolls
      WHERE roll_number ~ '^[0-9]{2}x'
      GROUP BY 1
      ORDER BY 1 DESC
    `,

    sql<{ label: string; count: number }[]>`
      SELECT
        COALESCE(c.nickname, c.brand || ' ' || c.model) AS label,
        COUNT(*)::int AS count
      FROM rolls r
      JOIN cameras c ON c.id = r.camera_id
      WHERE r.camera_id IS NOT NULL
      GROUP BY c.id, c.nickname, c.brand, c.model
      ORDER BY count DESC
      LIMIT 10
    `,

    sql<{ label: string; count: number }[]>`
      SELECT
        COALESCE(f.nickname, f.brand || ' ' || f.name) AS label,
        COUNT(*)::int AS count
      FROM rolls r
      JOIN films f ON f.id = r.film_id
      WHERE r.film_id IS NOT NULL
      GROUP BY f.id, f.nickname, f.brand, f.name
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
        topCameras: topCameras as { label: string; count: number }[],
        topFilms: topFilms as { label: string; count: number }[],
        statusCounts: statusCounts as { status: string; count: number }[],
      }}
    />
  );
}
