import { Suspense } from "react";
import ArchiveClient from "./ArchiveClient";

export const dynamic = "force-dynamic";

export default function ArchivePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="text-zinc-400">Loading...</div></div>}>
      <ArchiveClient />
    </Suspense>
  );
}
