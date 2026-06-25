// @lovable.dev/vite-tanstack-config already includes tanstackStart, viteReact,
// tailwindcss, tsConfigPaths, nitro (Cloudflare by default in Lovable builds),
// componentTagger (dev), VITE_* env injection, @ alias, React/TanStack dedupe,
// and sandbox detection. Do not add those plugins manually.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
// The GitHub Pages mirror is produced by `scripts/build-gh-pages.mjs`
// AFTER a normal Cloudflare build. We do not run nitro's static preset:
// it breaks on a stray SSR-build step (`rollupOptions.input should not be
// an html file when building for SSR`) and only ever prerenders `/`.
// Keeping the default Lovable build pipeline here means SSR on the Lovable
// host stays intact, and the script in `scripts/` repackages `dist/` into
// `.output/public/` with prerendered HTML, sitemaps, and OG SVGs for GH Pages.
export default defineConfig({});
