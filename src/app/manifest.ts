import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Redes Adamari | Ateliê Adamari",
    short_name: "Redes Adamari",
    description:
      "Redes de dormir em tecido Tactel leves, frescas e resistentes com punhos em cordas 2,50mm c/ proteção UV.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF6F0",
    theme_color: "#D95D39",
    icons: [
      {
        src: "/images/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
