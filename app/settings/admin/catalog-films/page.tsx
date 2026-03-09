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
      <BackButton />
      <h1 className="text-3xl font-bold">Catalog Films</h1>
      <CatalogFilmsClient initialFilms={films} />
    </div>
  );
}
