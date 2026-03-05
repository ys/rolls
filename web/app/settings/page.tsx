import { sql } from "@/lib/db";
import type { Camera, Film } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

function cameraLabel(c: Camera): string {
  return c.nickname ?? `${c.brand} ${c.model}`;
}

function filmLabel(f: Film): string {
  if (f.nickname) return f.nickname;
  const iso = f.show_iso && f.iso ? ` ${f.iso}` : "";
  return `${f.brand} ${f.name}${iso}`;
}

export default async function SettingsPage() {
  const [cameras, films] = await Promise.all([
    sql<Camera[]>`
      SELECT c.*, COUNT(r.roll_number)::int AS roll_count
      FROM cameras c
      LEFT JOIN rolls r ON r.camera_id = c.id
      GROUP BY c.id
      ORDER BY COUNT(r.roll_number) DESC, COALESCE(c.nickname, c.brand || ' ' || c.model)
    `,
    sql<Film[]>`
      SELECT f.*, COUNT(r.roll_number)::int AS roll_count
      FROM films f
      LEFT JOIN rolls r ON r.film_id = f.id
      GROUP BY f.id
      ORDER BY COUNT(r.roll_number) DESC, COALESCE(f.nickname, f.brand || ' ' || f.name)
    `,
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* Cameras section */}
      <section className="mb-8">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-bold">Cameras</h2>
          <Link
            href="/cameras"
            className="text-sm text-amber-600 dark:text-amber-400"
          >
            Manage →
          </Link>
        </div>
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {cameras.map((c) => (
            <li key={c.id}>
              <Link
                href={`/cameras/${encodeURIComponent(c.id)}`}
                className="flex items-center justify-between bg-white dark:bg-zinc-900 px-4 py-3 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors"
              >
                <div>
                  <div className="font-medium text-[15px]">{cameraLabel(c)}</div>
                  <div className="text-[13px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {c.format}mm
                    {c.roll_count ? ` · ${c.roll_count} roll${c.roll_count === 1 ? "" : "s"}` : ""}
                  </div>
                </div>
                <svg className="w-4 h-4 text-zinc-300 dark:text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/cameras"
              className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-3 text-[15px] text-amber-600 dark:text-amber-400 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors"
            >
              <span className="text-lg leading-none">+</span>
              <span>Add Camera</span>
            </Link>
          </li>
        </ul>
        {cameras.length === 0 && (
          <p className="text-zinc-400 text-sm text-center py-4">No cameras yet.</p>
        )}
      </section>

      {/* Films section */}
      <section className="mb-8">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-bold">Films</h2>
          <Link
            href="/films"
            className="text-sm text-amber-600 dark:text-amber-400"
          >
            Manage →
          </Link>
        </div>
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {films.map((f) => (
            <li key={f.id}>
              <Link
                href={`/films/${encodeURIComponent(f.id)}`}
                className="flex items-center justify-between bg-white dark:bg-zinc-900 px-4 py-3 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors"
              >
                <div>
                  <div className="font-medium text-[15px]">{filmLabel(f)}</div>
                  <div className="text-[13px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {f.color ? "Color" : "B&W"}
                    {f.iso ? ` · ISO ${f.iso}` : ""}
                    {f.roll_count ? ` · ${f.roll_count} roll${f.roll_count === 1 ? "" : "s"}` : ""}
                  </div>
                </div>
                <svg className="w-4 h-4 text-zinc-300 dark:text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/films"
              className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-3 text-[15px] text-amber-600 dark:text-amber-400 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors"
            >
              <span className="text-lg leading-none">+</span>
              <span>Add Film</span>
            </Link>
          </li>
        </ul>
        {films.length === 0 && (
          <p className="text-zinc-400 text-sm text-center py-4">No films yet.</p>
        )}
      </section>
    </div>
  );
}
