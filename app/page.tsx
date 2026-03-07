import { Suspense } from "react";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="text-zinc-400">Loading...</div></div>}>
      <HomeClient />
    </Suspense>
  );
}
