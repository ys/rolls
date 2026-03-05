"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCachedData } from "@/hooks/useCachedData";
import { rollStatus, STATUS_COLORS } from "@/lib/status";
import type { Roll } from "@/lib/db";
import PullToRefresh from "@/components/PullToRefresh";
import { RollSkeleton } from "@/components/Skeleton";
import { haptics } from "@/lib/haptics";

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
        onClick={() => haptics.light()}
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

export default function HomeClient() {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const headers: HeadersInit = apiKey
    ? { Authorization: `Bearer ${apiKey}` }
    : {};

  const { data, isLoading } = useCachedData<HomeData>(
    ["rolls", "home"],
    async () => {
      const res = await fetch("/api/rolls/home", { headers });
      if (!res.ok) throw new Error("Failed to fetch rolls");
      return res.json();
    },
    { apiKey }
  );

  const router = useRouter();

  const handleRefresh = async () => {
    router.refresh();
  };

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        {[1, 2, 3, 4].map((i) => (
          <RollSkeleton key={i} />
        ))}
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

  const { rolls } = data;

  const inProgress = rolls
    .filter((r) => !r.lab_at)
    .sort(
      (a, b) =>
        (IN_PROGRESS_ORDER[rollStatus(a)] ?? 9) -
        (IN_PROGRESS_ORDER[rollStatus(b)] ?? 9)
    );
  const atLab = rolls.filter((r) => r.lab_at);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div>
        <h1 className="text-3xl font-bold mb-6">Rolls</h1>
        {rolls.length === 0 ? (
          <p className="text-zinc-500 text-center py-16">
            No active rolls. Tap + to create one!
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
                <ul>
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
                <ul>
                  {atLab.map((roll) => (
                    <RollItem key={roll.roll_number} roll={roll} />
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
