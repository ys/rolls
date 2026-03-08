"use client";

import { useRouter } from "next/navigation";
import PullToRefresh from "@/components/PullToRefresh";
import { STATUS_ORDER } from "@/lib/status";

// Solid bar colors per status
const STATUS_BAR: Record<string, string> = {
  LOADED: "bg-kodak-400",
  FRIDGE: "bg-cyan-400",
  LAB: "bg-orange-400",
  SCANNED: "bg-green-400",
  PROCESSED: "bg-purple-400",
  UPLOADED: "bg-blue-400",
  ARCHIVED: "bg-zinc-400",
};

const STATUS_LABEL_COLOR: Record<string, string> = {
  LOADED: "text-kodak-600 dark:text-kodak-400",
  FRIDGE: "text-cyan-600 dark:text-cyan-400",
  LAB: "text-orange-600 dark:text-orange-400",
  SCANNED: "text-green-600 dark:text-green-400",
  PROCESSED: "text-purple-600 dark:text-purple-400",
  UPLOADED: "text-blue-600 dark:text-blue-400",
  ARCHIVED: "text-zinc-500 dark:text-zinc-400",
};

interface StatsData {
  rollsPerYear: { year: string; count: number }[];
  topCameras: { label: string; count: number }[];
  topFilms: { label: string; count: number }[];
  statusCounts: { status: string; count: number }[];
}

export default function StatsClient({
  initialData,
}: {
  initialData: StatsData;
}) {
  const router = useRouter();
  const data = initialData;

  const totalRolls = data.rollsPerYear.reduce((s, r) => s + r.count, 0);
  const firstYear = data.rollsPerYear.at(-1)?.year ?? "—";
  const avgPerYear =
    data.rollsPerYear.length > 0
      ? Math.round(totalRolls / data.rollsPerYear.length)
      : 0;

  const maxPerYear = Math.max(...data.rollsPerYear.map((r) => r.count), 1);
  const maxCamera = Math.max(...data.topCameras.map((r) => r.count), 1);
  const maxFilm = Math.max(...data.topFilms.map((r) => r.count), 1);

  const statusMap = Object.fromEntries(
    data.statusCounts.map((r) => [r.status, r.count]),
  );

  // Scanned = everything with scanned_at set (all statuses from SCANNED up)
  const scannedStatuses = ["SCANNED", "PROCESSED", "UPLOADED", "ARCHIVED"];
  const totalScanned = scannedStatuses.reduce(
    (s, st) => s + (statusMap[st] ?? 0),
    0,
  );
  const pctScanned =
    totalRolls > 0 ? Math.round((totalScanned / totalRolls) * 100) : 0;

  return (
    <PullToRefresh
      onRefresh={async () => {
        router.refresh();
      }}
    >
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-bold mb-6">Stats</h1>

          {/* Hero numbers */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <HeroStat label="Rolls" value={totalRolls} />
            <HeroStat label="Since" value={firstYear} />
            <HeroStat label="Per year" value={avgPerYear} />
          </div>

          {/* Scanned % pill */}
          {totalRolls > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl px-4 py-3 flex items-center justify-between border border-zinc-100 dark:border-transparent">
              <span className="text-sm text-zinc-500">Scanned or beyond</span>
              <div className="flex items-center gap-2">
                <div className="w-28 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-400 rounded-full"
                    style={{ width: `${pctScanned}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400 w-9 text-right">
                  {pctScanned}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <section>
          <SectionTitle>By Status</SectionTitle>
          <div className="space-y-2">
            {STATUS_ORDER.filter((s) => statusMap[s]).map((status) => {
              const count = statusMap[status] ?? 0;
              const pct = totalRolls > 0 ? (count / totalRolls) * 100 : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold w-20 shrink-0 ${STATUS_LABEL_COLOR[status]}`}
                  >
                    {status}
                  </span>
                  <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${STATUS_BAR[status] ?? "bg-zinc-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-6 text-right tabular-nums">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Rolls per year */}
        <section>
          <SectionTitle>By Year</SectionTitle>
          <div className="space-y-2.5">
            {data.rollsPerYear.map((r) => (
              <div key={r.year} className="flex items-center gap-3">
                <span className="font-mono text-sm w-10 shrink-0 text-zinc-500 dark:text-zinc-400">
                  {r.year}
                </span>
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-kodak-400 h-full rounded-full transition-all"
                    style={{ width: `${(r.count / maxPerYear) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-6 text-right tabular-nums">
                  {r.count}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Top cameras */}
        {data.topCameras.length > 0 && (
          <section>
            <SectionTitle>Top Cameras</SectionTitle>
            <RankedList items={data.topCameras} max={maxCamera} />
          </section>
        )}

        {/* Top films */}
        {data.topFilms.length > 0 && (
          <section>
            <SectionTitle>Top Films</SectionTitle>
            <RankedList items={data.topFilms} max={maxFilm} />
          </section>
        )}
      </div>
    </PullToRefresh>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">
      {children}
    </h2>
  );
}

function HeroStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl px-3 py-4 text-center border border-zinc-100 dark:border-transparent">
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-zinc-500 mt-1 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

function RankedList({
  items,
  max,
}: {
  items: { label: string; count: number }[];
  max: number;
}) {
  return (
    <div className="space-y-2.5">
      {items.map((r, i) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-400 w-4 text-right shrink-0 tabular-nums">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium truncate">{r.label}</span>
              <span className="text-sm font-semibold text-zinc-500 shrink-0 tabular-nums ml-auto">
                {r.count}
              </span>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-kodak-400 rounded-full transition-all"
                style={{ width: `${(r.count / max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
