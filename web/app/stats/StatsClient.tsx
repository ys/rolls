"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PullToRefresh from "@/components/PullToRefresh";
import { STATUS_COLORS, STATUS_ORDER } from "@/lib/status";

interface StatsData {
  rollsPerYear: { year: string; count: number }[];
  topCameras: { camera_id: string; count: number }[];
  topFilms: { film_id: string; count: number }[];
  statusCounts: { status: string; count: number }[];
}

export default function StatsClient({ initialData }: { initialData: StatsData }) {
  const router = useRouter();
  const [data] = useState(initialData);

  async function handleRefresh() {
    router.refresh();
  }

  const totalRolls = data.rollsPerYear.reduce((s, r) => s + r.count, 0);
  const firstYear = data.rollsPerYear.at(-1)?.year ?? "—";
  const maxPerYear = Math.max(...data.rollsPerYear.map((r) => r.count), 1);
  const maxCamera = Math.max(...data.topCameras.map((r) => r.count), 1);
  const maxFilm = Math.max(...data.topFilms.map((r) => r.count), 1);

  const statusMap = Object.fromEntries(
    data.statusCounts.map((r) => [r.status, r.count])
  );

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-bold mb-6">Stats</h1>
          {/* Top-line numbers */}
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Total rolls" value={totalRolls} />
            <Stat label="Since" value={firstYear} />
            <Stat label="Years" value={data.rollsPerYear.length} />
          </div>
        </div>

        {/* Rolls per year */}
        <section>
          <h2 className="text-base font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
            By Year
          </h2>
          <div className="space-y-2">
            {data.rollsPerYear.map((r) => (
              <div key={r.year} className="flex items-center gap-3">
                <span className="font-mono text-sm w-10 shrink-0 text-zinc-500 dark:text-zinc-400">
                  {r.year}
                </span>
                <div className="flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-full h-5 overflow-hidden">
                  <div
                    className="bg-zinc-500 dark:bg-zinc-400 h-full rounded-full"
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
          <h2 className="text-base font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
            By Status
          </h2>
          <div className="space-y-1.5">
            {STATUS_ORDER.filter((s) => statusMap[s]).map((status) => {
              const count = statusMap[status] ?? 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium w-24 text-center shrink-0 ${STATUS_COLORS[status]}`}
                  >
                    {status}
                  </span>
                  <div className="flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-zinc-500 dark:bg-zinc-400"
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
          <h2 className="text-base font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
            Top Cameras
          </h2>
          <div className="space-y-2">
            {data.topCameras.map((r) => (
              <div key={r.camera_id} className="flex items-center gap-3">
                <span className="text-sm w-40 truncate shrink-0">{r.camera_id}</span>
                <div className="flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-zinc-500 dark:bg-zinc-400 h-full rounded-full"
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
          <h2 className="text-base font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
            Top Films
          </h2>
          <div className="space-y-2">
            {data.topFilms.map((r) => (
              <div key={r.film_id} className="flex items-center gap-3">
                <span className="text-sm w-40 truncate shrink-0">{r.film_id}</span>
                <div className="flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-zinc-500 dark:bg-zinc-400 h-full rounded-full"
                    style={{ width: `${(r.count / maxFilm) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">{r.count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PullToRefresh>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 text-center border border-zinc-100 dark:border-transparent">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-zinc-500 mt-1">{label}</div>
    </div>
  );
}
