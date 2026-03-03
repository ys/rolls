import { sql } from "@/lib/db";
import { rollStatus } from "@/lib/db";
import { STATUS_COLORS } from "@/lib/status";
import type { Roll } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

const IN_PROGRESS_ORDER: Record<string, number> = { LOADED: 0, FRIDGE: 1 };

function rollYear(roll: Roll): string {
  const m = roll.roll_number.match(/^(\d{2})x/i);
  if (m) return `20${m[1]}`;
  if (roll.shot_at) return roll.shot_at.slice(0, 4);
  return "—";
}

function RollRow({ roll }: { roll: Roll }) {
  const status = rollStatus(roll);
  return (
    <li>
      <Link
        href={`/roll/${roll.roll_number}`}
        className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors"
      >
        <div>
          <div className="font-mono font-bold text-base">{roll.roll_number}</div>
          <div className="text-sm text-zinc-400 mt-0.5">
            {[roll.camera_id, roll.film_id].filter(Boolean).join(" · ")}
          </div>
          {roll.shot_at && (
            <div className="text-xs text-zinc-500 mt-0.5">
              {new Date(roll.shot_at).toLocaleDateString()}
            </div>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[status]}`}>
          {status}
        </span>
      </Link>
    </li>
  );
}

export default async function HomePage() {
  const rolls = await sql<Roll[]>`SELECT * FROM rolls ORDER BY roll_number DESC`;

  const unscanned = rolls.filter((r) => !r.scanned_at);
  const inProgress = unscanned
    .filter((r) => !r.lab_at)
    .sort((a, b) => (IN_PROGRESS_ORDER[rollStatus(a)] ?? 9) - (IN_PROGRESS_ORDER[rollStatus(b)] ?? 9));
  const atLab = unscanned.filter((r) => r.lab_at);

  const historical = rolls.filter((r) => r.scanned_at);

  // Group historical by year, preserving DESC order within each year
  const byYear = new Map<string, Roll[]>();
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
                {inProgress.map((roll) => <RollRow key={roll.roll_number} roll={roll} />)}
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
                {atLab.map((roll) => <RollRow key={roll.roll_number} roll={roll} />)}
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
                  {yearRolls.map((roll) => <RollRow key={roll.roll_number} roll={roll} />)}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
