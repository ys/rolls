import { StatCardSkeleton, ChartSkeleton } from "@/components/Skeleton";

export default function StatsLoading() {
  return (
    <div style={{ paddingBottom: 80, margin: "0 -16px" }}>
      <div style={{ padding: "0 20px 12px" }}>
        <div className="h-4 w-16 animate-pulse" style={{ background: "var(--border)" }} />
      </div>
      <div style={{ display: "flex", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div style={{ padding: "16px 20px 0" }}>
        <ChartSkeleton />
      </div>
    </div>
  );
}
