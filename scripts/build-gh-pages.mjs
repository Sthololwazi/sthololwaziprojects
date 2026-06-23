#!/usr/bin/env bun
/**
 * Build the static GitHub Pages mirror.
 *
 * Pipeline:
 *   1. Run a normal Cloudflare build (`bun run build`) — produces
 *      `dist/client/` (assets) and `dist/server/index.mjs` (the worker).
 *   2. Boot the worker in this Node/Bun process and `fetch()` every public
 *      route. The worker SSRs the page and we write the HTML to
 *      `.output/public/<route>/index.html`.
 *   3. Generate sitemaps and per-project OG SVGs directly from the
 *      shared helpers in `src/lib/`.
 *   4. Copy `dist/client/*` (assets, robots.txt) into `.output/public/`.
 *   5. Copy `index.html` → `404.html` so GH Pages deep links work.
 *   6. Touch `.nojekyll` so paths starting with `_` are served.
 *
 * Run from the repo root: `bun run scripts/build-gh-pages.mjs`.
 */

import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DIST_CLIENT = path.join(ROOT, "dist", "client");
const DIST_SERVER = path.join(ROOT, "dist", "server", "index.mjs");
const OUT = path.join(ROOT, ".output", "public");
const SITE_URL = "https://sthololwaziprojects.lovable.app";

const HTML_ROUTES = [
  "/",
  "/about",
  "/services",
  "/projects",
  "/contact",
];

function log(msg) {
  console.log(`[gh-pages] ${msg}`);
}

async function exec(cmd, args) {
  log(`$ ${cmd} ${args.join(" ")}`);
  await new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", env: process.env });
    p.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`)),
    );
  });
}

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  for (const entry of await fs.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}

async function writeFile(rel, body) {
  const full = path.join(OUT, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, body);
  log(`wrote ${rel} (${body.length} bytes)`);
}

async function main() {
  // 1. Vite + nitro Cloudflare build.
  await exec("bun", ["x", "vite", "build"]);

  // Fresh output dir.
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });

  // 4 (do early so generated files can overwrite if needed).
  await copyDir(DIST_CLIENT, OUT);

  // 3a. Shared helpers (TS, loaded directly by Bun).
  const { renderSitemapIndex, renderPagesSitemap, renderProjectsSitemap } =
    await import(pathToFileURL(path.join(ROOT, "src/lib/sitemaps.ts")).href);
  const { renderProjectOgSvg } = await import(
    pathToFileURL(path.join(ROOT, "src/lib/og.ts")).href
  );
  const { projects } = await import(
    pathToFileURL(path.join(ROOT, "src/data/projects.ts")).href
  );
  const { serviceSlugs, projectSlugs } = await import(
    pathToFileURL(path.join(ROOT, "src/data/slugs.ts")).href
  );

  await writeFile("sitemap.xml", renderSitemapIndex());
  await writeFile("sitemap-pages.xml", renderPagesSitemap());
  await writeFile("sitemap-projects.xml", renderProjectsSitemap());

  // 3b. Per-project OG SVGs.
  for (const p of projects) {
    await writeFile(`api/og/projects/${p.slug}.svg`, renderProjectOgSvg(p));
  }

  // 2. Boot the worker and SSR every route.
  log(`loading worker from ${path.relative(ROOT, DIST_SERVER)}`);
  const workerMod = await import(pathToFileURL(DIST_SERVER).href);
  const worker = workerMod.default ?? workerMod;
  if (typeof worker?.fetch !== "function") {
    throw new Error("Worker module has no default.fetch handler");
  }

  const allRoutes = [
    ...HTML_ROUTES,
    ...serviceSlugs.map((s) => `/services/${s}`),
    ...projectSlugs.map((s) => `/projects/${s}`),
  ];

  for (const route of allRoutes) {
    const req = new Request(`${SITE_URL}${route}`, {
      method: "GET",
      headers: { "user-agent": "lovable-gh-pages-prerender" },
    });
    let res;
    try {
      res = await worker.fetch(req, {}, { waitUntil() {}, passThroughOnException() {} });
    } catch (err) {
      console.warn(`[gh-pages] SSR failed for ${route}: ${err?.message ?? err}`);
      continue;
    }
    if (!res || res.status >= 400) {
      console.warn(`[gh-pages] ${route} → status ${res?.status}`);
      continue;
    }
    const html = await res.text();
    const out =
      route === "/" ? "index.html" : path.join(route.replace(/^\//, ""), "index.html");
    await writeFile(out, html);
  }

  // 5. SPA fallback so deep links survive on GitHub Pages.
  const indexHtml = await fs.readFile(path.join(OUT, "index.html"), "utf8");
  await writeFile("404.html", indexHtml);

  // 6. Jekyll opt-out.
  await fs.writeFile(path.join(OUT, ".nojekyll"), "");

  log("done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
