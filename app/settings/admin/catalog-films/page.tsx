import { redirect } from "next/navigation";
import { getUser } from "@/lib/request-context";
import { sql, type CatalogFilm } from "@/lib/db";
import BackButton from "@/components/BackButton";
import CatalogFilmsClient from "./CatalogFilmsClient";

export const dynamic = "force-dynamic";

export default async function CatalogFilmsPage() {
  const { role } = await getUser();
  if (role !== "admin") redirect("/settings");

  const films = await sql<CatalogFilm[]>`
    SELECT * FROM catalog_films ORDER BY brand, name, iso
  `.catch(() => [] as CatalogFilm[]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <BackButton />
        <h1 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>Catalog Films</h1>
        <div className="w-8" />
      </div>
      <CatalogFilmsClient initialFilms={films} />
    </div>
  );
}
