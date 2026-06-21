// @lovable.dev/vite-tanstack-config already includes tanstackStart, viteReact,
// tailwindcss, tsConfigPaths, nitro (Cloudflare by default in Lovable builds),
// componentTagger (dev), VITE_* env injection, @ alias, React/TanStack dedupe,
// and sandbox detection. Do not add those plugins manually.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

import { projects } from "./src/data/projects";
import { services } from "./src/data/services";

// GH Pages static mirror: built in CI with GH_PAGES=1 and served under
// https://<user>.github.io/sthololwazi/. The Lovable SSR build leaves base "/"
// and uses the wrapper's default Cloudflare nitro preset.
const isGhPages = process.env.GH_PAGES === "1";
const ghPagesBase = "/sthololwazi/";

// Routes the static prerender crawler needs to know about up front. Dynamic
// segments must be enumerated — TanStack Start can't guess slugs.
const prerenderRoutes = [
  "/",
  "/about",
  "/services",
  "/projects",
  "/contact",
  ...services.map((s) => `/services/${s.slug}`),
  ...projects.map((p) => `/projects/${p.slug}`),
  "/sitemap.xml",
  "/sitemap-pages.xml",
  "/sitemap-projects.xml",
  ...projects.map((p) => `/api/og/projects/${p.slug}.svg`),
];

export default defineConfig({
  vite: {
    base: isGhPages ? ghPagesBase : "/",
  },
  ...(isGhPages
    ? {
        // Force a fully static build outside the Lovable sandbox so the
        // .output/public/ directory is publishable to GitHub Pages as-is.
        nitro: { preset: "static" },
        tanstackStart: {
          prerender: {
            enabled: true,
            crawlLinks: true,
            failOnError: false,
            routes: prerenderRoutes,
          },
          // Tell the router which paths to emit as fully static .html files.
          pages: prerenderRoutes
            .filter((r) => !r.includes(".xml") && !r.includes(".svg"))
            .map((path) => ({ path, prerender: { enabled: true } })),
        },
      }
    : {}),
});
