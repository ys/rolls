import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rolls",
    short_name: "Rolls",
    description: "Film roll tracker",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#FF9500",
    background_color: "#ffffff",
    icons: [
      { src: "/api/icon?size=48",  sizes: "48x48",   type: "image/png" },
      { src: "/api/icon?size=96",  sizes: "96x96",   type: "image/png" },
      { src: "/api/icon?size=192", sizes: "192x192", type: "image/png" },
      { src: "/api/icon?size=512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
