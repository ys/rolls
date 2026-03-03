import { sql } from "@/lib/db";
import { STATUS_COLORS, STATUS_ORDER } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const [rollsPerYear, topCameras, topFilms, statusCounts] = await Promise.all([
    // Rolls per year derived from roll_number prefix (e.g. 25x01 → 2025)
    sql`
      SELECT
        '20' || SUBSTRING(roll_number, 1, 2) AS year,
        COUNT(*)::int AS count
      FROM rolls
      WHERE roll_number ~ '^[0-9]{2}x'
      GROUP BY 1
      ORDER BY 1 DESC
    `,

    sql`
      SELECT camera_id, COUNT(*)::int AS count
      FROM rolls
      WHERE camera_id IS NOT NULL
      GROUP BY camera_id
      ORDER BY count DESC
      LIMIT 10
    `,

    sql`
      SELECT film_id, COUNT(*)::int AS count
      FROM rolls
      WHERE film_id IS NOT NULL
      GROUP BY film_id
      ORDER BY count DESC
      LIMIT 10
    `,

    sql`
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

  const totalRolls = (rollsPerYear as { count: number }[]).reduce((s, r) => s + r.count, 0);
  const firstYear = (rollsPerYear as { year: string }[]).at(-1)?.year ?? "—";
  const maxPerYear = Math.max(...(rollsPerYear as { count: number }[]).map((r) => r.count), 1);
  const maxCamera  = Math.max(...(topCameras as { count: number }[]).map((r) => r.count), 1);
  const maxFilm    = Math.max(...(topFilms as { count: number }[]).map((r) => r.count), 1);

  // Build status map keyed by status string
  const statusMap = Object.fromEntries(
    (statusCounts as { status: string; count: number }[]).map((r) => [r.status, r.count])
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-4">Stats</h1>
        {/* Top-line numbers */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Total rolls" value={totalRolls} />
          <Stat label="Since" value={firstYear} />
          <Stat label="Years" value={(rollsPerYear as unknown[]).length} />
        </div>
      </div>

      {/* Rolls per year */}
      <section>
        <h2 className="text-base font-semibold text-zinc-400 uppercase tracking-wider mb-3">By Year</h2>
        <div className="space-y-2">
          {(rollsPerYear as { year: string; count: number }[]).map((r) => (
            <div key={r.year} className="flex items-center gap-3">
              <span className="font-mono text-sm w-10 shrink-0 text-zinc-400">{r.year}</span>
              <div className="flex-1 bg-zinc-800 rounded-full h-5 overflow-hidden">
                <div
                  className="bg-zinc-400 h-full rounded-full"
                  style={{ width: `${(r.count / maxPerYear) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-8 text-right">{r.count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Status breakdown */}
      <section>
        <h2 className="text-base font-semibold text-zinc-400 uppercase tracking-wider mb-3">By Status</h2>
        <div className="space-y-1.5">
          {STATUS_ORDER.filter((s) => statusMap[s]).map((status) => {
            const count = statusMap[status] ?? 0;
            return (
              <div key={status} className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-24 text-center shrink-0 ${STATUS_COLORS[status]}`}>
                  {status}
                </span>
                <div className="flex-1 bg-zinc-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-zinc-400"
                    style={{ width: `${(count / totalRolls) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top cameras */}
      <section>
        <h2 className="text-base font-semibold text-zinc-400 uppercase tracking-wider mb-3">Top Cameras</h2>
        <div className="space-y-2">
          {(topCameras as { camera_id: string; count: number }[]).map((r) => (
            <div key={r.camera_id} className="flex items-center gap-3">
              <span className="text-sm w-40 truncate shrink-0">{r.camera_id}</span>
              <div className="flex-1 bg-zinc-800 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-zinc-400 h-full rounded-full"
                  style={{ width: `${(r.count / maxCamera) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-8 text-right">{r.count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Top films */}
      <section>
        <h2 className="text-base font-semibold text-zinc-400 uppercase tracking-wider mb-3">Top Films</h2>
        <div className="space-y-2">
          {(topFilms as { film_id: string; count: number }[]).map((r) => (
            <div key={r.film_id} className="flex items-center gap-3">
              <span className="text-sm w-40 truncate shrink-0">{r.film_id}</span>
              <div className="flex-1 bg-zinc-800 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-zinc-400 h-full rounded-full"
                  style={{ width: `${(r.count / maxFilm) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-8 text-right">{r.count}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-zinc-500 mt-1">{label}</div>
    </div>
  );
}
