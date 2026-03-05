import { sql } from "@/lib/db";
import { Suspense } from "react";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

async function getFirstYear() {
  const rows = await sql<{ year: string }[]>`
    SELECT '20' || SUBSTRING(roll_number, 1, 2) AS year
    FROM rolls
    WHERE roll_number ~ '^[0-9]{2}x'
    ORDER BY 1 ASC
    LIMIT 1
  `;
  return rows[0] ? parseInt(rows[0].year, 10) : new Date().getFullYear();
}

export default async function HomePage() {
  const firstYear = await getFirstYear();

  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="text-zinc-400">Loading...</div></div>}>
      <HomeClient firstYear={firstYear} />
    </Suspense>
  );
}
