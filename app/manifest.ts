import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Selvo — Personal Finance Tracker",
    short_name: "Selvo",
    description:
      "Track income, expenses, and budgets with full data ownership. Bring your own Firebase.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#CF4500",
    icons: [
      {
        src: "/assets/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/assets/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
