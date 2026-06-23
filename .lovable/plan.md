## Goal
Verify that the GitHub Pages mirror actually emits correct per-project OG/Twitter SVGs, sitemaps, and canonical URLs — and fix the one real bug I spotted while reading the code before running the build.

## Bug found by inspection

`src/routes/projects.$slug.tsx` advertises the OG image as:

```
${SITE_URL}/api/og/projects/${slug}.svg
```

But the route file is `src/routes/api/og/projects.$slug.ts` with `createFileRoute("/api/og/projects/$slug")`. When a crawler (or the prerenderer) fetches `/api/og/projects/500-rdp-houses.svg`, the router sets `params.slug = "500-rdp-houses.svg"`. Then:

```ts
const p = getProject(params.slug) ?? { name: "Sthololwazi Projects", ... }
```

`getProject("500-rdp-houses.svg")` returns `undefined`, so **every project falls back to the same generic SVG** on both the Lovable SSR site and the GH Pages mirror. The per-project OG image has never actually rendered.

## Plan

### 1. Fix slug stripping in the OG handler
In `src/routes/api/og/projects.$slug.ts`, normalize the slug before lookup:

```ts
const slug = params.slug.replace(/\.svg$/i, "");
const p = getProject(slug) ?? { /* fallback */ };
```

Also use the cleaned `slug` in `Content-Disposition`.

### 2. Build the static mirror locally and inspect

```bash
GH_PAGES=1 bun run build
ls .output/public
ls .output/public/api/og/projects
```

Verify presence and contents of:
- `index.html`, `404.html` (CI workflow copies index→404; reproduce locally)
- `sitemap.xml`, `sitemap-pages.xml`, `sitemap-projects.xml`
- `robots.txt`
- `/api/og/projects/<slug>.svg` for every entry in `src/data/slugs.ts` (5 files)
- One prerendered `index.html` per project route under `/projects/<slug>/`

For each prerendered project HTML, grep that:
- `<link rel="canonical" href="https://sthololwaziprojects.lovable.app/projects/<slug>">` is present
- `og:url`, `og:image`, `twitter:image` all use the absolute `sthololwaziprojects.lovable.app` host (not localhost, not github.io)

For each OG SVG, confirm the project name appears in the file (i.e. per-project, not the generic fallback) — this is the verification that step 1's fix actually took effect.

For each sitemap, confirm `<loc>` entries use `https://sthololwaziprojects.lovable.app`.

### 3. Regenerate / patch missing outputs

If the build is missing any expected file from the list above, diagnose:
- Missing OG SVG → add the slug to `assetRoutes` in `vite.config.ts` (already covers `projectSlugs`, but recheck) or fix the prerender route mismatch.
- Missing sitemap → ensure the `[.]xml.ts` server route is included via crawler or add the path to `assetRoutes`.
- Wrong canonical host → already handled by `SITE_URL`; if a file still shows localhost, find the offending route and replace `request.url`/`window.location` with `SITE_URL`.

Re-run the build until `ls` shows every expected file and grep checks pass.

### 4. Report

Summarize for the user:
- The OG slug bug and the one-line fix
- Exact file counts emitted (`5 OG svgs, 3 sitemaps, 11 prerendered HTML pages`, etc.)
- Confirmation that canonical/og:url use the Lovable host on the static mirror so SEO consolidates to the primary domain.

## Out of scope
No changes to routing, SITE_URL, the redirect script, or the CI workflows unless step 2 surfaces a concrete failure.