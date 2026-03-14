import { sql } from "@/lib/db";
import { getUserId } from "@/lib/request-context";
import StatsClient from "./StatsClient";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const userId = await getUserId();

  const [topCameras, topFilms, statusCounts, monthlyActivity, frameTotals] = await Promise.all([
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
      LIMIT 8
    `,

    sql<{ label: string; count: number }[]>`
      SELECT
        COALESCE(f.nickname, f.brand || ' ' || f.name) AS label,
        COUNT(*)::int AS count
      FROM rolls r
      JOIN films f ON f.uuid = r.film_uuid
      WHERE r.film_uuid IS NOT NULL
        AND r.user_id = ${userId}
      GROUP BY f.uuid, f.nickname, f.brand, f.name
      ORDER BY count DESC
      LIMIT 8
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

    // Monthly roll count for the current year (by shot_at month)
    sql<{ month: number; count: number }[]>`
      SELECT
        EXTRACT(MONTH FROM shot_at)::int AS month,
        COUNT(*)::int AS count
      FROM rolls
      WHERE user_id = ${userId}
        AND shot_at IS NOT NULL
        AND EXTRACT(YEAR FROM shot_at) = EXTRACT(YEAR FROM NOW())
      GROUP BY 1
      ORDER BY 1
    `,

    // Total rolls + estimated frames (36 per roll for 35mm, 12 for 120, 4 for LF)
    sql<{ total_rolls: number; total_frames: number }[]>`
      SELECT
        COUNT(*)::int AS total_rolls,
        COALESCE(SUM(
          CASE
            WHEN c.format = '120'              THEN 12
            WHEN c.format IN ('4x5','large')   THEN 4
            ELSE 36
          END
        ), COUNT(*) * 36)::int AS total_frames
      FROM rolls r
      LEFT JOIN cameras c ON c.uuid = r.camera_uuid
      WHERE r.user_id = ${userId}
    `,
  ]);

  const { total_rolls, total_frames } = frameTotals[0] ?? { total_rolls: 0, total_frames: 0 };
  const statusMap = Object.fromEntries(statusCounts.map((r) => [r.status, r.count]));
  const inLabCount = statusMap["LAB"] ?? 0;

  return (
    <StatsClient
      initialData={{
        totalRolls: total_rolls,
        totalFrames: total_frames,
        inLabCount,
        topCameras,
        topFilms,
        monthlyActivity,
      }}
    />
  );
}
