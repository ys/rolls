import { getUserId } from "@/lib/request-context";
import { getFilms } from "@/lib/queries";
import FilmsClient from "./FilmsClient";

export const dynamic = "force-dynamic";

export default async function FilmsPage() {
  const userId = await getUserId();
  const films = await getFilms(userId);
  return <FilmsClient initialFilms={films} />;
}
