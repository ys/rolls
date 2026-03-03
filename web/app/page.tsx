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

function rollYear(roll: RollRow): string {
  const m = roll.roll_number.match(/^(\d{2})x/i);
  if (m) return `20${m[1]}`;
  if (roll.shot_at) return roll.shot_at.slice(0, 4);
  return "—";
}

function RollItem({ roll }: { roll: RollRow }) {
  const status = rollStatus(roll);
  return (
    <li>
      <Link
        href={`/roll/${roll.roll_number}`}
        className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors"
      >
        {roll.contact_sheet_url ? (
          <img
            src={roll.contact_sheet_url}
            alt=""
            className="w-16 h-16 object-cover rounded-lg shrink-0"
          />
        ) : (
          <div className="w-16 h-16 bg-zinc-800 rounded-lg shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-mono font-bold text-base">{roll.roll_number}</div>
          <div className="text-sm text-zinc-400 mt-0.5 truncate">
            {[cameraLabel(roll), filmLabel(roll)].filter(Boolean).join(" · ")}
          </div>
          {roll.shot_at && (
            <div className="text-xs text-zinc-500 mt-0.5">
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

export default async function HomePage() {
  const rolls = await sql<RollRow[]>`
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
    ORDER BY r.roll_number DESC
  `;

  const unscanned = rolls.filter((r) => !r.scanned_at);
  const inProgress = unscanned
    .filter((r) => !r.lab_at)
    .sort((a, b) => (IN_PROGRESS_ORDER[rollStatus(a)] ?? 9) - (IN_PROGRESS_ORDER[rollStatus(b)] ?? 9));
  const atLab = unscanned.filter((r) => r.lab_at);

  const historical = rolls.filter((r) => r.scanned_at);

  // Group historical by year, preserving DESC order within each year
  const byYear = new Map<string, RollRow[]>();
  for (const roll of historical) {
    const year = rollYear(roll);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(roll);
  }
  const years = [...byYear.keys()].sort((a, b) => b.localeCompare(a));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Rolls</h1>
        <Link
          href="/new"
          className="bg-white text-black px-4 py-2 rounded-lg font-medium text-sm active:scale-95 transition-transform"
        >
          New Roll
        </Link>
      </div>

      {rolls.length === 0 ? (
        <p className="text-zinc-500 text-center py-16">No rolls yet. Create one!</p>
      ) : (
        <div className="space-y-8">
          {/* In-progress: LOADED + FRIDGE */}
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

          {/* At the lab */}
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

          {/* Historical rolls grouped by year */}
          {years.map((year) => {
            const yearRolls = byYear.get(year)!;
            return (
              <section key={year}>
                <div className="flex items-baseline gap-2 mb-3">
                  <h2 className="text-lg font-bold">{year}</h2>
                  <span className="text-sm text-zinc-500">{yearRolls.length} roll{yearRolls.length !== 1 ? "s" : ""}</span>
                </div>
                <ul className="space-y-2">
                  {yearRolls.map((roll) => <RollItem key={roll.roll_number} roll={roll} />)}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
