"use client";

import { useRouter } from "next/navigation";
import NewRollSheet from "@/components/NewRollSheet";

export default function NewRollPage() {
  const router = useRouter();
  return (
    <div style={{ minHeight: "100%", backgroundColor: "var(--bg)" }}>
      <NewRollSheet open={true} onClose={() => router.back()} />
    </div>
  );
}
