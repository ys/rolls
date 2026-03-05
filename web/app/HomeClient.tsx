"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCachedData } from "@/hooks/useCachedData";
import { rollStatus, STATUS_COLORS } from "@/lib/status";
import type { Roll } from "@/lib/db";

const STATUS_DOT: Record<string, string> = {
  LOADED: "bg-amber-400",
  FRIDGE: "bg-cyan-400",
  LAB: "bg-orange-400",
  SCANNED: "bg-green-400",
  PROCESSED: "bg-purple-400",
  UPLOADED: "bg-blue-400",
  ARCHIVED: "bg-zinc-300 dark:bg-zinc-600",
};

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

interface HomeData {
  rolls: RollRow[];
  currentYear: number;
  viewYear: number | null;
}

const IN_PROGRESS_ORDER: Record<string, number> = { LOADED: 0, FRIDGE: 1 };

function cameraLabel(roll: RollRow): string {
  if (roll.camera_nickname) return roll.camera_nickname;
  if (roll.camera_brand && roll.camera_model)
    return `${roll.camera_brand} ${roll.camera_model}`;
  return roll.camera_id ?? "";
}

function filmLabel(roll: RollRow): string {
  if (roll.film_nickname) return roll.film_nickname;
  if (roll.film_brand && roll.film_name) {
    const iso =
      roll.film_show_iso && roll.film_iso ? ` ${roll.film_iso}` : "";
    return `${roll.film_brand} ${roll.film_name}${iso}`;
  }
  return roll.film_id ?? "";
}

function RollItem({ roll }: { roll: RollRow }) {
  const status = rollStatus(roll);
  const dateStr = roll.shot_at
    ? new Date(roll.shot_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;
  const subtitle = [cameraLabel(roll), filmLabel(roll)]
    .filter(Boolean)
    .join(" · ");
  return (
    <li className="border-b border-zinc-200 dark:border-zinc-800 last:border-b-0">
      <Link
        href={`/roll/${roll.roll_number}`}
        className="flex items-start gap-3 py-3 active:bg-zinc-100 dark:active:bg-zinc-800/50 -mx-4 px-4 transition-colors"
      >
        <div
          className={`w-2 h-2 rounded-full shrink-0 mt-[7px] ${
            STATUS_DOT[status] ?? "bg-zinc-300"
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-semibold text-[15px] truncate">
              {roll.roll_number}
            </span>
            {dateStr && (
              <span className="text-[13px] text-zinc-400 dark:text-zinc-500 shrink-0">
                {dateStr}
              </span>
            )}
          </div>
          {subtitle && (
            <div className="text-[14px] text-zinc-600 dark:text-zinc-300 truncate mt-0.5">
              {subtitle}
            </div>
          )}
          <div className="text-[13px] text-zinc-400 dark:text-zinc-500 mt-0.5">
            {status}
          </div>
        </div>
        <svg
          className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0 mt-[3px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>
    </li>
  );
}

export default function HomeClient({ firstYear }: { firstYear: number }) {
  const searchParams = useSearchParams();
  const yearParam = searchParams.get("year");

  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const headers: HeadersInit = apiKey
    ? { Authorization: `Bearer ${apiKey}` }
    : {};

  const { data, isLoading } = useCachedData<HomeData>(
    ["rolls", "home", yearParam ?? "current"],
    async () => {
      const url = yearParam
        ? `/api/rolls/home?year=${yearParam}`
        : "/api/rolls/home";
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to fetch rolls");
      return res.json();
    },
    { apiKey }
  );

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-zinc-400">No data available</div>
      </div>
    );
  }

  const { rolls, currentYear, viewYear } = data;
  const isPastYear = viewYear !== null && viewYear < currentYear;

  if (isPastYear && viewYear) {
    // Past year view
    const prevYear = viewYear - 1;
    const nextYear = viewYear + 1;
    const showPrev = prevYear >= firstYear;
    const showNext = nextYear <= currentYear;

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          {showNext ? (
            <Link
              href={nextYear === currentYear ? "/" : `/?year=${nextYear}`}
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xl leading-none"
            >
              ←
            </Link>
          ) : (
            <span className="text-zinc-300 dark:text-zinc-700 text-xl leading-none">
              ←
            </span>
          )}
          <h1 className="text-2xl font-bold">{viewYear}</h1>
          {showPrev ? (
            <Link
              href={`/?year=${prevYear}`}
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xl leading-none"
            >
              →
            </Link>
          ) : (
            <span className="text-zinc-300 dark:text-zinc-700 text-xl leading-none">
              →
            </span>
          )}
        </div>

        {rolls.length === 0 ? (
          <p className="text-zinc-500 text-center py-16">
            No rolls in {viewYear}.
          </p>
        ) : (
          <ul>
            {rolls.map((roll) => (
              <RollItem key={roll.roll_number} roll={roll} />
            ))}
          </ul>
        )}

        <div className="mt-8 text-sm text-zinc-500 text-center">
          {rolls.length > 0 && (
            <span>
              {rolls.length} roll{rolls.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Current year view
  const unscanned = rolls.filter((r) => !r.scanned_at);
  const inProgress = unscanned
    .filter((r) => !r.lab_at)
    .sort(
      (a, b) =>
        (IN_PROGRESS_ORDER[rollStatus(a)] ?? 9) -
        (IN_PROGRESS_ORDER[rollStatus(b)] ?? 9)
    );
  const atLab = unscanned.filter((r) => r.lab_at);
  const historical = rolls.filter((r) => r.scanned_at);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Rolls</h1>
      {rolls.length === 0 ? (
        <p className="text-zinc-500 text-center py-16">
          No rolls yet. Create one!
        </p>
      ) : (
        <div className="space-y-8">
          {inProgress.length > 0 && (
            <section>
              <div className="flex items-baseline gap-2 mb-3">
                <h2 className="text-lg font-bold">In Progress</h2>
                <span className="text-sm text-zinc-500">
                  {inProgress.length}
                </span>
              </div>
              <ul className="space-y-2">
                {inProgress.map((roll) => (
                  <RollItem key={roll.roll_number} roll={roll} />
                ))}
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
                {atLab.map((roll) => (
                  <RollItem key={roll.roll_number} roll={roll} />
                ))}
              </ul>
            </section>
          )}

          {historical.length > 0 && (
            <section>
              <div className="flex items-baseline gap-2 mb-3">
                <h2 className="text-lg font-bold">{currentYear}</h2>
                <span className="text-sm text-zinc-500">
                  {historical.length} roll{historical.length !== 1 ? "s" : ""}
                </span>
              </div>
              <ul className="space-y-2">
                {historical.map((roll) => (
                  <RollItem key={roll.roll_number} roll={roll} />
                ))}
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
              {Array.from(
                { length: currentYear - firstYear },
                (_, i) => currentYear - 1 - i
              ).map((y) => (
                <Link
                  key={y}
                  href={`/?year=${y}`}
                  className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
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
