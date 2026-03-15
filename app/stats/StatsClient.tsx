"use client";

import { useRouter } from "next/navigation";
import PullToRefresh from "@/components/PullToRefresh";

const MONTH_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

interface StatsData {
  totalRolls: number;
  totalFrames: number;
  inLabCount: number;
  topCameras: { label: string; count: number }[];
  topFilms: { label: string; count: number }[];
  monthlyActivity: { month: number; count: number }[];
}

export default function StatsClient({ initialData }: { initialData: StatsData }) {
  const router = useRouter();
  const { totalRolls, totalFrames, inLabCount, topCameras, topFilms, monthlyActivity } = initialData;

  const currentYear = new Date().getFullYear();

  // Build 12-month array for bar chart
  const monthMap = Object.fromEntries(monthlyActivity.map((r) => [r.month, r.count]));
  const months = Array.from({ length: 12 }, (_, i) => monthMap[i + 1] ?? 0);
  const maxMonthCount = Math.max(...months, 1);

  const maxCamera = Math.max(...topCameras.map((r) => r.count), 1);
  const maxFilm = Math.max(...topFilms.map((r) => r.count), 1);

  return (
    <PullToRefresh onRefresh={async () => { router.refresh(); }}>
      <div style={{ paddingBottom: 80, margin: "0 -16px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 12px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-primary)" }}>STATS</span>
          <span style={{ fontSize: 9, color: "var(--text-tertiary)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{currentYear}</span>
        </div>

        {/* Big number strip */}
        <div style={{ display: "flex", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <BigStat label="Rolls" value={totalRolls.toLocaleString()} />
          <BigStat label="Frames" value={totalFrames.toLocaleString()} border />
          <BigStat label="In Lab" value={inLabCount.toLocaleString()} amber border />
        </div>

        {/* Top Cameras */}
        {topCameras.length > 0 && (
          <div style={{ padding: "16px 20px 0" }}>
            <SectionLabel>Top Cameras</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topCameras.map((r) => (
                <BarRow key={r.label} label={r.label} count={r.count} pct={(r.count / maxCamera) * 100} color="var(--accent)" />
              ))}
            </div>
          </div>
        )}

        {/* Top Films */}
        {topFilms.length > 0 && (
          <div style={{ padding: "16px 20px 0", marginTop: 4 }}>
            <SectionLabel>Top Films</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topFilms.map((r) => (
                <BarRow key={r.label} label={r.label} count={r.count} pct={(r.count / maxFilm) * 100} color="var(--text-primary)" />
              ))}
            </div>
          </div>
        )}

        {/* Monthly Activity */}
        <div style={{ padding: "16px 20px 24px", marginTop: 4 }}>
          <SectionLabel>Monthly Activity</SectionLabel>
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 48 }}>
            {months.map((count, i) => {
              const heightPx = count > 0 ? Math.max(2, Math.round((count / maxMonthCount) * 40)) : 2;
              const isActive = count > 0;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                  <div style={{ width: "100%", background: isActive ? "var(--accent)" : "var(--border)", borderRadius: 1, height: heightPx }} />
                  <div style={{ fontSize: 7, color: "var(--text-tertiary)" }}>{MONTH_LABELS[i]}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </PullToRefresh>
  );
}

function BigStat({ label, value, border, amber }: { label: string; value: string; border?: boolean; amber?: boolean }) {
  return (
    <div style={{
      flex: 1, padding: "14px 0", textAlign: "center",
      borderLeft: border ? "1px solid var(--border)" : undefined,
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: amber ? "var(--accent)" : "var(--text-primary)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-tertiary)", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-tertiary)", borderTop: "1px solid var(--border)", paddingTop: 12, marginBottom: 10 }}>
      {children}
    </div>
  );
}

function BarRow({ label, count, pct, color }: { label: string; count: number; pct: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-primary)", marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ color: "var(--text-tertiary)" }}>{count}</span>
      </div>
      <div style={{ height: 3, background: "var(--border)", borderRadius: 2 }}>
        <div style={{ height: 3, width: `${pct}%`, background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}
