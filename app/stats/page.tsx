import { sql } from "@/lib/db";
import { getUserId } from "@/lib/request-context";
import StatsClient from "./StatsClient";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const userId = await getUserId();

  const [rollsPerYear, topCameras, topFilms, statusCounts] = await Promise.all([
    sql<{ year: string; count: number }[]>`
      SELECT
        '20' || SUBSTRING(roll_number, 1, 2) AS year,
        COUNT(*)::int AS count
      FROM rolls
      WHERE roll_number ~ '^[0-9]{2}x'
        AND user_id = ${userId}
      GROUP BY 1
      ORDER BY 1 DESC
    `,

    sql<{ label: string; count: number }[]>`
      SELECT
        COALESCE(c.nickname, c.brand || ' ' || c.model) AS label,
        COUNT(*)::int AS count
      FROM rolls r
      JOIN cameras c ON c.uuid = r.camera_uuid
      WHERE r.camera_uuid IS NOT NULL
        AND r.user_id = ${userId}
      GROUP BY c.uuid, c.nickname, c.brand, c.model
      ORDER BY count DESC
      LIMIT 10
    `,

    sql<{ label: string; count: number; slug: string }[]>`
      SELECT
        COALESCE(f.nickname, f.brand || ' ' || f.name) AS label,
        COUNT(*)::int AS count,
        f.slug
      FROM rolls r
      JOIN films f ON f.uuid = r.film_uuid
      WHERE r.film_uuid IS NOT NULL
        AND r.user_id = ${userId}
      GROUP BY f.uuid, f.nickname, f.brand, f.name, f.slug
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
      WHERE user_id = ${userId}
      GROUP BY 1
    `,
  ]);

  return (
    <StatsClient
      initialData={{
        rollsPerYear: rollsPerYear as { year: string; count: number }[],
        topCameras: topCameras as { label: string; count: number }[],
        topFilms: topFilms as { label: string; count: number; slug: string }[],
        statusCounts: statusCounts as { status: string; count: number }[],
      }}
    />
  );
}
