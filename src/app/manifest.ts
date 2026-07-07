import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "All In One Connect",
    short_name: "Connect",
    description: "One QR. Every Business Connection.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/next.svg", // Fallback to existing asset for safety
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
