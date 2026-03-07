import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rolls",
    short_name: "Rolls",
    description: "Film roll tracker",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#f59e0b",
    icons: [
      { src: "/icon.png",       sizes: "32x32",   type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
