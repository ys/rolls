import { Suspense } from "react";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="text-xs" style={{ color: "var(--darkroom-text-tertiary)" }}>Loading...</div></div>}>
      <HomeClient />
    </Suspense>
  );
}
