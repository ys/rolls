import { getUserId } from "@/lib/request-context";
import { getCameras } from "@/lib/queries";
import CamerasClient from "./CamerasClient";

export const dynamic = "force-dynamic";

export default async function CamerasPage() {
  const userId = await getUserId();
  const cameras = await getCameras(userId);
  return <CamerasClient initialCameras={cameras} />;
}
