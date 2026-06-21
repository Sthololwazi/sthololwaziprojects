// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages serves the site under https://<user>.github.io/<repo>/
// When building the static mirror we set GH_PAGES=1 in CI so asset URLs are
// prefixed with /sthololwazi/. The Lovable (SSR) build leaves base as "/".
const isGhPages = process.env.GH_PAGES === "1";
const ghPagesBase = "/sthololwazi/";

export default defineConfig({
  vite: {
    base: isGhPages ? ghPagesBase : "/",
  },
});
