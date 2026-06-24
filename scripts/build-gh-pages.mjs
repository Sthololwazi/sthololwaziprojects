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

const HTML_ROUTES = ["/", "/about", "/services", "/projects", "/contact"];

function log(msg) {
  console.log(`[gh-pages] ${msg}`);
}

async function exec(cmd, args) {
  log(`$ ${cmd} ${args.join(" ")}`);
  await new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", env: process.env });
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
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
  const { renderSitemapIndex, renderPagesSitemap, renderProjectsSitemap } = await import(
    pathToFileURL(path.join(ROOT, "src/lib/sitemaps.ts")).href
  );
  const { renderProjectOgSvg } = await import(pathToFileURL(path.join(ROOT, "src/lib/og.ts")).href);
  const { projects } = await import(pathToFileURL(path.join(ROOT, "src/data/projects.ts")).href);
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

  const renderedRoutes = new Set();
  const failedRoutes = [];
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
      failedRoutes.push(`${route} (threw: ${err?.message ?? err})`);
      continue;
    }
    if (!res || res.status >= 400) {
      console.warn(`[gh-pages] ${route} → status ${res?.status}`);
      failedRoutes.push(`${route} (status ${res?.status})`);
      continue;
    }
    const html = await res.text();
    const out = route === "/" ? "index.html" : path.join(route.replace(/^\//, ""), "index.html");
    await writeFile(out, html);
    renderedRoutes.add(route);
  }

  // 5. SPA fallback so deep links survive on GitHub Pages.
  const indexHtml = await fs.readFile(path.join(OUT, "index.html"), "utf8");
  await writeFile("404.html", indexHtml);

  // 6. Jekyll opt-out.
  await fs.writeFile(path.join(OUT, ".nojekyll"), "");

  // 7. Verify every sitemap <loc> uses SITE_URL and resolves to a real
  //    file on the mirror (rendered index.html for HTML routes, the asset
  //    file for things like /api/og/projects/<slug>.svg).
  await verifySitemaps();

  // 8. Compare prerendered routes ↔ sitemap-pages.xml ↔ mirror filesystem.
  await verifyRouteCoverage(allRoutes, renderedRoutes, failedRoutes);

  // 9. Verify required static files exist and reference SITE_URL where applicable.
  await verifyRequiredFiles();

  log("done.");
}

async function verifySitemaps() {
  const sitemaps = ["sitemap.xml", "sitemap-pages.xml", "sitemap-projects.xml"];
  const errors = [];
  for (const name of sitemaps) {
    const xml = await fs.readFile(path.join(OUT, name), "utf8");
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    const imgs = [...xml.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((m) => m[1].trim());
    if (locs.length === 0) errors.push(`${name}: no <loc> entries found`);
    for (const loc of [...locs, ...imgs]) {
      if (loc !== SITE_URL && !loc.startsWith(`${SITE_URL}/`)) {
        errors.push(`${name}: <loc> not on SITE_URL (${SITE_URL}): ${loc}`);
        continue;
      }
      const pathPart = loc.slice(SITE_URL.length) || "/";
      // Nested sitemap or any asset with an extension → file must exist.
      if (/\.[a-z0-9]+$/i.test(pathPart)) {
        const rel = pathPart.replace(/^\//, "");
        try {
          await fs.access(path.join(OUT, rel));
        } catch {
          errors.push(`${name}: missing on disk for ${loc} (expected ${rel})`);
        }
        continue;
      }
      // HTML route → rendered index.html must exist.
      const rel =
        pathPart === "/" ? "index.html" : path.join(pathPart.replace(/^\//, ""), "index.html");
      try {
        await fs.access(path.join(OUT, rel));
      } catch {
        errors.push(`${name}: no rendered HTML for ${loc} (expected ${rel})`);
      }
    }
    log(`verified ${name} (${locs.length} <loc>, ${imgs.length} <image:loc>)`);
  }
  if (errors.length) {
    for (const e of errors) console.error(`[gh-pages] SITEMAP CHECK FAIL — ${e}`);
    throw new Error(`Sitemap verification failed (${errors.length} issue(s))`);
  }
  log("sitemap verification passed");
}

async function verifyRouteCoverage(expectedRoutes, renderedRoutes, failedRoutes) {
  const errors = [];

  if (failedRoutes.length) {
    for (const f of failedRoutes) errors.push(`prerender failed for ${f}`);
  }

  const expected = new Set(expectedRoutes);
  for (const r of expected) {
    if (!renderedRoutes.has(r)) errors.push(`expected route not rendered: ${r}`);
  }
  for (const r of renderedRoutes) {
    if (!expected.has(r)) errors.push(`unexpected rendered route: ${r}`);
  }

  // Sitemap-pages.xml: HTML routes from the sitemap must match the
  // prerendered set exactly (no missing pages, no orphaned URLs).
  const pagesXml = await fs.readFile(path.join(OUT, "sitemap-pages.xml"), "utf8");
  const sitemapRoutes = new Set(
    [...pagesXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((m) => m[1].trim())
      .filter((u) => u === SITE_URL || u.startsWith(`${SITE_URL}/`))
      .map((u) => {
        const p = u.slice(SITE_URL.length) || "/";
        return p === "" ? "/" : p;
      })
      .filter((p) => !/\.[a-z0-9]+$/i.test(p)),
  );
  for (const r of expected) {
    if (!sitemapRoutes.has(r)) errors.push(`route missing from sitemap-pages.xml: ${r}`);
  }
  for (const r of sitemapRoutes) {
    if (!expected.has(r)) errors.push(`sitemap-pages.xml lists unrendered route: ${r}`);
  }

  // Mirror filesystem: every HTML route must have its index.html, and we
  // walk the output dir to surface any stray rendered page not in the
  // expected set.
  const expectedFiles = new Set(
    [...expected].map((r) =>
      r === "/" ? "index.html" : path.posix.join(r.replace(/^\//, ""), "index.html"),
    ),
  );
  // 404.html is the SPA fallback, not a "route" — always allowed.
  expectedFiles.add("404.html");

  const foundFiles = new Set();
  async function walk(dir, prefix = "") {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      // Skip generated asset trees — only inspect prerendered HTML pages.
      if (entry.isDirectory()) {
        if (["assets", "api", "_build", "_server"].includes(entry.name) && !prefix) continue;
        await walk(full, rel);
      } else if (entry.name === "index.html" || rel === "404.html") {
        foundFiles.add(rel);
      }
    }
  }
  await walk(OUT);
  for (const f of expectedFiles) {
    if (!foundFiles.has(f)) errors.push(`mirror missing HTML file: ${f}`);
  }
  for (const f of foundFiles) {
    if (!expectedFiles.has(f)) errors.push(`mirror has unexpected HTML file: ${f}`);
  }

  if (errors.length) {
    for (const e of errors) console.error(`[gh-pages] ROUTE COVERAGE FAIL — ${e}`);
    throw new Error(`Route coverage verification failed (${errors.length} issue(s))`);
  }
  log(`route coverage passed (${expected.size} routes ↔ sitemap ↔ mirror)`);
}

async function verifyRequiredFiles() {
  const errors = [];
  const required = ["index.html", "404.html", "robots.txt"];
  for (const f of required) {
    try {
      await fs.access(path.join(OUT, f));
    } catch {
      errors.push(`missing required file: ${f}`);
    }
  }

  // index.html and 404.html must reference SITE_URL (canonical / og:url).
  for (const f of ["index.html", "404.html"]) {
    try {
      const html = await fs.readFile(path.join(OUT, f), "utf8");
      if (!html.includes(SITE_URL)) {
        errors.push(`${f} does not reference SITE_URL (${SITE_URL})`);
      }
    } catch {
      /* missing already reported */
    }
  }

  // robots.txt must point its Sitemap: directive at SITE_URL.
  try {
    const robots = await fs.readFile(path.join(OUT, "robots.txt"), "utf8");
    const sitemapLines = robots.split(/\r?\n/).filter((l) => /^\s*Sitemap:/i.test(l));
    if (sitemapLines.length === 0) {
      errors.push(`robots.txt has no Sitemap: directive`);
    } else {
      for (const line of sitemapLines) {
        const url = line.replace(/^\s*Sitemap:\s*/i, "").trim();
        if (!url.startsWith(`${SITE_URL}/`)) {
          errors.push(`robots.txt Sitemap: directive not on SITE_URL: ${url}`);
        }
      }
    }
  } catch {
    /* missing already reported */
  }

  if (errors.length) {
    for (const e of errors) console.error(`[gh-pages] REQUIRED FILES FAIL — ${e}`);
    throw new Error(`Required-file verification failed (${errors.length} issue(s))`);
  }
  log("required files + SITE_URL references verified");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
