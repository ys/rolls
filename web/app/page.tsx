import { sql } from "@/lib/db";
import { rollStatus } from "@/lib/db";
import { STATUS_COLORS } from "@/lib/status";
import type { Roll } from "@/lib/db";
import Link from "next/link";

type RollRow = Roll & {
  camera_nickname: string | null;
  camera_brand: string | null;
  camera_model: string | null;
  film_nickname: string | null;
  film_brand: string | null;
  film_name: string | null;
  film_iso: number | null;
  film_show_iso: boolean | null;
};

export const dynamic = "force-dynamic";

async function getHomeRolls() {
  const currentYear = new Date().getFullYear();
  const yearPrefix = String(currentYear).slice(2);
  const yearStart = `${currentYear}-01-01`;
  const yearEnd   = `${currentYear + 1}-01-01`;
  return sql<RollRow[]>`
    SELECT r.*,
      c.nickname  AS camera_nickname,
      c.brand     AS camera_brand,
      c.model     AS camera_model,
      f.nickname  AS film_nickname,
      f.brand     AS film_brand,
      f.name      AS film_name,
      f.iso       AS film_iso,
      f.show_iso  AS film_show_iso
    FROM rolls r
    LEFT JOIN cameras c ON c.id = r.camera_id
    LEFT JOIN films   f ON f.id = r.film_id
    WHERE r.archived_at IS NULL
      AND (
        r.scanned_at IS NULL
        OR r.roll_number ILIKE ${yearPrefix + "x%"}
        OR (r.shot_at >= ${yearStart} AND r.shot_at < ${yearEnd})
      )
    ORDER BY r.roll_number DESC
  `;
}

async function getYearRolls(year: number) {
  const yearPrefix = String(year).slice(2);
  const yearStart = `${year}-01-01`;
  const yearEnd   = `${year + 1}-01-01`;
  return sql<RollRow[]>`
    SELECT r.*,
      c.nickname  AS camera_nickname,
      c.brand     AS camera_brand,
      c.model     AS camera_model,
      f.nickname  AS film_nickname,
      f.brand     AS film_brand,
      f.name      AS film_name,
      f.iso       AS film_iso,
      f.show_iso  AS film_show_iso
    FROM rolls r
    LEFT JOIN cameras c ON c.id = r.camera_id
    LEFT JOIN films   f ON f.id = r.film_id
    WHERE r.archived_at IS NULL
      AND (
        r.roll_number ILIKE ${yearPrefix + "x%"}
        OR (r.shot_at >= ${yearStart} AND r.shot_at < ${yearEnd})
      )
    ORDER BY r.roll_number DESC
  `;
}

async function getFirstYear() {
  const rows = await sql<{ year: string }[]>`
    SELECT '20' || SUBSTRING(roll_number, 1, 2) AS year
    FROM rolls
    WHERE roll_number ~ '^[0-9]{2}x'
    ORDER BY 1 ASC
    LIMIT 1
  `;
  return rows[0] ? parseInt(rows[0].year, 10) : new Date().getFullYear();
}

const IN_PROGRESS_ORDER: Record<string, number> = { LOADED: 0, FRIDGE: 1 };

function cameraLabel(roll: RollRow): string {
  if (roll.camera_nickname) return roll.camera_nickname;
  if (roll.camera_brand && roll.camera_model) return `${roll.camera_brand} ${roll.camera_model}`;
  return roll.camera_id ?? "";
}

function filmLabel(roll: RollRow): string {
  if (roll.film_nickname) return roll.film_nickname;
  if (roll.film_brand && roll.film_name) {
    const iso = roll.film_show_iso && roll.film_iso ? ` ${roll.film_iso}` : "";
    return `${roll.film_brand} ${roll.film_name}${iso}`;
  }
  return roll.film_id ?? "";
}

function RollItem({ roll }: { roll: RollRow }) {
  const status = rollStatus(roll);
  return (
    <li>
      <Link
        href={`/roll/${roll.roll_number}`}
        className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        {roll.contact_sheet_url ? (
          <img
            src={roll.contact_sheet_url}
            alt=""
            className="w-16 h-16 object-cover rounded-lg shrink-0"
          />
        ) : (
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-mono font-bold text-base">{roll.roll_number}</div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
            {[cameraLabel(roll), filmLabel(roll)].filter(Boolean).join(" · ")}
          </div>
          {roll.shot_at && (
            <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              {new Date(roll.shot_at).toLocaleDateString()}
            </div>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[status]}`}>
          {status}
        </span>
      </Link>
    </li>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const currentYear = new Date().getFullYear();
  const viewYear = yearParam ? parseInt(yearParam, 10) : null;
  const isPastYear = viewYear !== null && viewYear < currentYear;

  const [rolls, firstYear] = await Promise.all([
    isPastYear ? getYearRolls(viewYear) : getHomeRolls(),
    getFirstYear(),
  ]);

  if (isPastYear) {
    // Past year view: just list all rolls for that year with year navigation
    const prevYear = viewYear - 1;
    const nextYear = viewYear + 1;
    const showPrev = prevYear >= firstYear;
    const showNext = nextYear <= currentYear;

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {showPrev ? (
              <Link href={`/?year=${prevYear}`} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xl leading-none">←</Link>
            ) : (
              <span className="text-zinc-300 dark:text-zinc-700 text-xl leading-none">←</span>
            )}
            <h1 className="text-2xl font-bold">{viewYear}</h1>
            {showNext ? (
              <Link href={nextYear === currentYear ? "/" : `/?year=${nextYear}`} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xl leading-none">→</Link>
            ) : (
              <span className="text-zinc-300 dark:text-zinc-700 text-xl leading-none">→</span>
            )}
          </div>
          <Link
            href="/new"
            className="bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium text-sm active:scale-95 transition-transform"
          >
            New Roll
          </Link>
        </div>

        {rolls.length === 0 ? (
          <p className="text-zinc-500 text-center py-16">No rolls in {viewYear}.</p>
        ) : (
          <ul className="space-y-2">
            {rolls.map((roll) => <RollItem key={roll.roll_number} roll={roll} />)}
          </ul>
        )}

        <div className="mt-8 text-sm text-zinc-500 text-center">
          {rolls.length > 0 && <span>{rolls.length} roll{rolls.length !== 1 ? "s" : ""}</span>}
        </div>
      </div>
    );
  }

  // Default: current year view
  const unscanned = rolls.filter((r) => !r.scanned_at);
  const inProgress = unscanned
    .filter((r) => !r.lab_at)
    .sort((a, b) => (IN_PROGRESS_ORDER[rollStatus(a)] ?? 9) - (IN_PROGRESS_ORDER[rollStatus(b)] ?? 9));
  const atLab = unscanned.filter((r) => r.lab_at);
  const historical = rolls.filter((r) => r.scanned_at);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Rolls</h1>
        <Link
          href="/new"
          className="bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium text-sm active:scale-95 transition-transform"
        >
          New Roll
        </Link>
      </div>

      {rolls.length === 0 ? (
        <p className="text-zinc-500 text-center py-16">No rolls yet. Create one!</p>
      ) : (
        <div className="space-y-8">
          {inProgress.length > 0 && (
            <section>
              <div className="flex items-baseline gap-2 mb-3">
                <h2 className="text-lg font-bold">In Progress</h2>
                <span className="text-sm text-zinc-500">{inProgress.length}</span>
              </div>
              <ul className="space-y-2">
                {inProgress.map((roll) => <RollItem key={roll.roll_number} roll={roll} />)}
              </ul>
            </section>
          )}

          {atLab.length > 0 && (
            <section>
              <div className="flex items-baseline gap-2 mb-3">
                <h2 className="text-lg font-bold">At the Lab</h2>
                <span className="text-sm text-zinc-500">{atLab.length}</span>
              </div>
              <ul className="space-y-2">
                {atLab.map((roll) => <RollItem key={roll.roll_number} roll={roll} />)}
              </ul>
            </section>
          )}

          {historical.length > 0 && (
            <section>
              <div className="flex items-baseline gap-2 mb-3">
                <h2 className="text-lg font-bold">{currentYear}</h2>
                <span className="text-sm text-zinc-500">{historical.length} roll{historical.length !== 1 ? "s" : ""}</span>
              </div>
              <ul className="space-y-2">
                {historical.map((roll) => <RollItem key={roll.roll_number} roll={roll} />)}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* Previous years navigation */}
      {currentYear - 1 >= firstYear && (
        <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <span>Previous years</span>
            <div className="flex gap-3">
              {Array.from({ length: currentYear - firstYear }, (_, i) => currentYear - 1 - i).map((y) => (
                <Link key={y} href={`/?year=${y}`} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  {y}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
