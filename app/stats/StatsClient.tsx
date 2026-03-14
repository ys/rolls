"use client";

import { useRouter } from "next/navigation";
import PullToRefresh from "@/components/PullToRefresh";
import { STATUS_ORDER } from "@/lib/status";
import { FILM_GRADIENTS } from "@/lib/film-gradients";

interface StatsData {
  rollsPerYear: { year: string; count: number }[];
  topCameras: { label: string; count: number }[];
  topFilms: { label: string; count: number; slug: string }[];
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
      <div className="space-y-10 pb-24">
        <div>
          <div className="flex items-center justify-between px-4 py-4 border-b mb-6" style={{ borderColor: "var(--border)" }}>
            <h1 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>
              STATS
            </h1>
          </div>

          {/* Hero numbers */}
          <div className="grid grid-cols-3 gap-3 mb-4 px-4">
            <HeroStat label="Rolls" value={totalRolls} />
            <HeroStat label="Since" value={firstYear} />
            <HeroStat label="Per year" value={avgPerYear} />
          </div>

          {/* Scanned % */}
          {totalRolls > 0 && (
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Scanned or beyond</span>
              <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                {pctScanned}%
              </span>
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <section className="px-4">
          <SectionTitle>By Status</SectionTitle>
          <div className="space-y-2">
            {STATUS_ORDER.filter((s) => statusMap[s]).map((status) => {
              const count = statusMap[status] ?? 0;
              const pct = totalRolls > 0 ? (count / totalRolls) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[10px] uppercase tracking-wide"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {status}
                    </span>
                    <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                      {count}
                    </span>
                  </div>
                  <div className="h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: "var(--accent)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Rolls per year */}
        <section className="px-4">
          <SectionTitle>By Year</SectionTitle>
          <div className="space-y-2">
            {data.rollsPerYear.map((r) => (
              <div key={r.year}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                    {r.year}
                  </span>
                  <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                    {r.count}
                  </span>
                </div>
                <div className="h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(r.count / maxPerYear) * 100}%`, backgroundColor: "var(--accent)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top cameras */}
        {data.topCameras.length > 0 && (
          <section className="px-4">
            <SectionTitle>Top Cameras</SectionTitle>
            <RankedList items={data.topCameras} max={maxCamera} />
          </section>
        )}

        {/* Top films */}
        {data.topFilms.length > 0 && (
          <section className="px-4">
            <SectionTitle>Top Films</SectionTitle>
            <RankedList items={data.topFilms} max={maxFilm} useFilmGradient />
          </section>
        )}
      </div>
    </PullToRefresh>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>
      {children}
    </h2>
  );
}

function HeroStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="py-2 text-center">
      <div className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{value}</div>
      <div className="text-[10px] mt-1 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
        {label}
      </div>
    </div>
  );
}

function RankedList({
  items,
  max,
  useFilmGradient,
}: {
  items: { label: string; count: number; slug?: string }[];
  max: number;
  useFilmGradient?: boolean;
}) {
  return (
    <div className="space-y-2">
      {items.map((r, i) => {
        const gradient = useFilmGradient && r.slug ? FILM_GRADIENTS[r.slug] : undefined;
        const barStyle: React.CSSProperties = gradient
          ? { width: `${(r.count / max) * 100}%`, background: `linear-gradient(to right, ${gradient[0]}, ${gradient[1]})` }
          : { width: `${(r.count / max) * 100}%`, backgroundColor: "var(--accent)" };

        return (
          <div key={r.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs flex-1 truncate" style={{ color: "var(--text-primary)" }}>
                {r.label}
              </span>
              <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                {r.count}
              </span>
            </div>
            <div className="h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={barStyle}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
