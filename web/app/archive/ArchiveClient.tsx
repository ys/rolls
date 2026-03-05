"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCachedData } from "@/hooks/useCachedData";
import { rollStatus } from "@/lib/status";
import type { Roll } from "@/lib/db";
import PullToRefresh from "@/components/PullToRefresh";
import { haptics } from "@/lib/haptics";

const STATUS_DOT: Record<string, string> = {
  SCANNED:   "bg-green-400",
  PROCESSED: "bg-purple-400",
  UPLOADED:  "bg-blue-400",
  ARCHIVED:  "bg-zinc-400",
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

interface ArchiveData {
  rolls: RollRow[];
}

function rollYear(roll: RollRow): number {
  // Derive year from roll_number (e.g. "25x01" → 2025) or from scanned_at
  const match = roll.roll_number.match(/^(\d{2})x/);
  if (match) return 2000 + parseInt(match[1], 10);
  if (roll.scanned_at) return new Date(roll.scanned_at).getFullYear();
  return new Date().getFullYear();
}

function filmLabel(roll: RollRow): string {
  if (roll.film_nickname) return roll.film_nickname;
  if (roll.film_brand && roll.film_name) {
    const iso = roll.film_show_iso && roll.film_iso ? ` ${roll.film_iso}` : "";
    return `${roll.film_brand} ${roll.film_name}${iso}`;
  }
  return roll.film_id ?? "";
}

function PlaceholderSheet({ rollNumber }: { rollNumber: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 dark:bg-zinc-900 select-none">
      {/* Sprocket holes top */}
      <div className="absolute top-0 inset-x-0 flex justify-around px-1 py-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-2 h-1.5 rounded-sm bg-zinc-700 dark:bg-zinc-800" />
        ))}
      </div>
      <span className="text-zinc-500 text-[11px] font-mono tracking-widest uppercase px-2 text-center">
        {rollNumber}
      </span>
      {/* Sprocket holes bottom */}
      <div className="absolute bottom-0 inset-x-0 flex justify-around px-1 py-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-2 h-1.5 rounded-sm bg-zinc-700 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}

function ArchiveCard({ roll }: { roll: RollRow }) {
  const status = rollStatus(roll);
  const label = filmLabel(roll);

  return (
    <Link
      href={`/roll/${roll.roll_number}`}
      onClick={() => haptics.light()}
      className="block relative aspect-square rounded-lg overflow-hidden bg-zinc-800 active:scale-95 transition-transform"
    >
      {roll.contact_sheet_url ? (
        <img
          src={roll.contact_sheet_url}
          alt={roll.roll_number}
          className="w-full h-full object-cover"
        />
      ) : (
        <PlaceholderSheet rollNumber={roll.roll_number} />
      )}
      {/* Overlay with roll info */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-4 pb-1.5 px-2">
        <div className="text-white text-[11px] font-semibold font-mono leading-tight truncate">
          {roll.roll_number}
        </div>
        {label && (
          <div className="text-white/60 text-[10px] truncate leading-tight">
            {label}
          </div>
        )}
      </div>
      {/* Status dot */}
      <div className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${STATUS_DOT[status] ?? "bg-zinc-400"} shadow-sm`} />
    </Link>
  );
}

export default function ArchiveClient() {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";
  const headers: HeadersInit = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

  const { data, isLoading } = useCachedData<ArchiveData>(
    ["rolls", "archive"],
    async () => {
      const res = await fetch("/api/rolls/archive", { headers });
      if (!res.ok) throw new Error("Failed to fetch archive");
      return res.json();
    },
    { apiKey }
  );

  const router = useRouter();

  if (isLoading && !data) {
    return (
      <div>
        <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.rolls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="text-4xl">🎞️</div>
        <p className="text-zinc-400 text-center">
          No scanned rolls yet.
          <br />Scanned rolls appear here.
        </p>
      </div>
    );
  }

  // Group rolls by year
  const byYear = new Map<number, RollRow[]>();
  for (const roll of data.rolls) {
    const year = rollYear(roll);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(roll);
  }
  const years = Array.from(byYear.keys()).sort((a, b) => b - a);

  return (
    <PullToRefresh onRefresh={async () => { router.refresh(); }}>
      <div>
        <h1 className="text-3xl font-bold mb-6">Archive</h1>
        <div className="space-y-8">
          {years.map((year) => {
            const yearRolls = byYear.get(year)!;
            return (
              <section key={year}>
                <div className="flex items-baseline gap-2 mb-3">
                  <h2 className="text-lg font-bold">{year}</h2>
                  <span className="text-sm text-zinc-500">
                    {yearRolls.length} roll{yearRolls.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {yearRolls.map((roll) => (
                    <ArchiveCard key={roll.roll_number} roll={roll} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </PullToRefresh>
  );
}
