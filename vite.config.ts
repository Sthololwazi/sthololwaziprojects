// @lovable.dev/vite-tanstack-config already includes tanstackStart, viteReact,
// tailwindcss, tsConfigPaths, nitro (Cloudflare by default in Lovable builds),
// componentTagger (dev), VITE_* env injection, @ alias, React/TanStack dedupe,
// and sandbox detection. Do not add those plugins manually.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// IMPORTANT: vite.config.ts is loaded by Node directly (not through Vite's
// resolver), so we can only import plain modules with no `@/...` aliases or
// asset imports. `slugs.ts` is the safe enumeration of dynamic route params.
import { projectSlugs, serviceSlugs } from "./src/data/slugs";

// GH Pages static mirror: built in CI with GH_PAGES=1 and served under
// https://<user>.github.io/sthololwazi/. The Lovable SSR build leaves base "/"
// and uses the wrapper's default Cloudflare nitro preset.
const isGhPages = process.env.GH_PAGES === "1";
const ghPagesBase = "/sthololwazi/";

const htmlRoutes = [
  "/",
  "/about",
  "/services",
  "/projects",
  "/contact",
  ...serviceSlugs.map((s) => `/services/${s}`),
  ...projectSlugs.map((s) => `/projects/${s}`),
];

const assetRoutes = [
  "/sitemap.xml",
  "/sitemap-pages.xml",
  "/sitemap-projects.xml",
  ...projectSlugs.map((s) => `/api/og/projects/${s}.svg`),
];

export default defineConfig({
  vite: {
    base: isGhPages ? ghPagesBase : "/",
  },
  ...(isGhPages
    ? {
        // Fully static build for GitHub Pages — emits .output/public/ with
        // pre-rendered HTML for every route below.
        nitro: { preset: "static" },
        tanstackStart: {
          prerender: {
            enabled: true,
            crawlLinks: true,
            failOnError: false,
            routes: [...htmlRoutes, ...assetRoutes],
          },
        },
      }
    : {}),
});
