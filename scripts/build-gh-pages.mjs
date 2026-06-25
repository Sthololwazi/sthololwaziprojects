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

  // 6b. Preserve custom domain binding — GitHub Pages reads CNAME from the
  //     uploaded artifact, not from the repo root.
  try {
    const cname = (await fs.readFile(path.join(ROOT, "CNAME"), "utf8")).trim();
    if (cname) {
      await fs.writeFile(path.join(OUT, "CNAME"), `${cname}\n`);
      log(`wrote CNAME (${cname})`);
    }
  } catch {
    log("no repo-root CNAME found; skipping custom-domain binding");
  }

  // 6c. Materialize Lovable CDN assets (/__l5e/...) referenced by rendered
  //     HTML so the mirror is fully self-contained on GH Pages.
  await materializeLovableAssets();

  // 7. Verify every sitemap <loc> uses SITE_URL and resolves to a real
  //    file on the mirror (rendered index.html for HTML routes, the asset
  //    file for things like /api/og/projects/<slug>.svg).
  await verifySitemaps();

  // 8. Compare prerendered routes ↔ sitemap-pages.xml ↔ mirror filesystem.
  await verifyRouteCoverage(allRoutes, renderedRoutes, failedRoutes);

  // 9. Verify required static files exist and reference SITE_URL where applicable.
  await verifyRequiredFiles();

  // 10. Internal link checker: every href/src in rendered HTML must resolve.
  await verifyInternalLinks();

  log("done.");
}

async function firstExisting(candidates) {
  for (const c of candidates) {
    try {
      const st = await fs.stat(path.join(OUT, c));
      if (st.isFile()) return c;
    } catch {
      /* try next */
    }
  }
  return null;
}

async function verifyInternalLinks() {
  const htmlFiles = [];
  async function walk(dir, prefix = "") {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!prefix && ["_build", "_server"].includes(entry.name)) continue;
        await walk(full, rel);
      } else if (entry.name.endsWith(".html")) {
        htmlFiles.push(rel);
      }
    }
  }
  await walk(OUT);

  const errors = [];
  let totalRefs = 0;
  const ATTR_RE = /\b(href|src|srcset)\s*=\s*("([^"]*)"|'([^']*)')/gi;

  function resolveCandidates(target) {
    const clean = target.split("#")[0].split("?")[0];
    if (!clean) return null;
    let p = clean;
    try {
      p = decodeURI(clean);
    } catch {
      /* keep raw */
    }
    if (p.startsWith("/")) p = p.slice(1);
    if (!p) return ["index.html"];
    const candidates = [p];
    if (!/\.[a-z0-9]+$/i.test(p)) {
      candidates.push(`${p}/index.html`, `${p}.html`);
    }
    return candidates;
  }

  async function check(file, attrName, raw) {
    const targets =
      attrName.toLowerCase() === "srcset"
        ? raw.split(",").map((s) => s.trim().split(/\s+/)[0])
        : [raw.trim()];
    for (const t of targets) {
      if (!t) continue;
      // External, protocol-relative, anchor, mailto/tel/data/javascript.
      if (t.startsWith("#") || t.startsWith("//")) continue;
      if (/^[a-z][a-z0-9+.-]*:/i.test(t)) {
        if (t === SITE_URL || t.startsWith(`${SITE_URL}/`)) {
          const internal = t.slice(SITE_URL.length) || "/";
          totalRefs++;
          const cands = resolveCandidates(internal);
          if (!cands) continue;
          if (!(await firstExisting(cands))) {
            errors.push(`${file}: dead link ${t} (tried ${cands.join(", ")})`);
          }
        }
        continue;
      }
      totalRefs++;
      let resolved;
      if (t.startsWith("/")) {
        resolved = t;
      } else {
        const baseDir = path.posix.dirname("/" + file);
        resolved = path.posix.normalize(path.posix.join(baseDir, t));
      }
      const cands = resolveCandidates(resolved);
      if (!cands) continue;
      if (!(await firstExisting(cands))) {
        errors.push(`${file}: dead link ${t} (tried ${cands.join(", ")})`);
      }
    }
  }

  for (const file of htmlFiles) {
    const html = await fs.readFile(path.join(OUT, file), "utf8");
    for (const m of html.matchAll(ATTR_RE)) {
      const attr = m[1];
      const raw = m[3] ?? m[4] ?? "";
      if (!raw) continue;
      await check(file, attr, raw);
    }
  }

  if (errors.length) {
    for (const e of errors) console.error(`[gh-pages] LINK CHECK FAIL — ${e}`);
    throw new Error(`Internal link check failed (${errors.length} dead link(s))`);
  }
  log(`internal link check passed (${htmlFiles.length} HTML files, ${totalRefs} refs)`);
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
      const extMatch = pathPart.match(/\.([a-z0-9]+)$/i);
      if (extMatch) {
        const ext = extMatch[1].toLowerCase();
        const rel = pathPart.replace(/^\//, "");
        const full = path.join(OUT, rel);
        let body;
        try {
          body = await fs.readFile(full);
        } catch {
          errors.push(`${name}: missing on disk for ${loc} (expected ${rel})`);
          continue;
        }
        const head = body.slice(0, 512).toString("utf8").trimStart();
        if (ext === "svg") {
          if (!head.startsWith("<?xml") && !head.startsWith("<svg")) {
            errors.push(`${name}: ${rel} is not an SVG (loc=${loc})`);
          } else if (!head.includes("<svg")) {
            errors.push(`${name}: ${rel} missing <svg> root (loc=${loc})`);
          }
        } else if (ext === "xml") {
          if (!head.startsWith("<?xml") && !head.startsWith("<")) {
            errors.push(`${name}: ${rel} is not XML (loc=${loc})`);
          }
        } else if (ext === "html" || ext === "htm") {
          if (!/<html[\s>]/i.test(head)) {
            errors.push(`${name}: ${rel} is not HTML (loc=${loc})`);
          }
        }
        // Unknown extensions: existence check above is sufficient.
        continue;
      }
      // No extension → HTML route. Rendered index.html must exist and look like HTML.
      const rel =
        pathPart === "/" ? "index.html" : path.join(pathPart.replace(/^\//, ""), "index.html");
      const full = path.join(OUT, rel);
      let body;
      try {
        body = await fs.readFile(full, "utf8");
      } catch {
        errors.push(`${name}: no rendered HTML for ${loc} (expected ${rel})`);
        continue;
      }
      if (!/<html[\s>]/i.test(body.slice(0, 1024))) {
        errors.push(`${name}: ${rel} does not look like HTML (loc=${loc})`);
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

  // Sitemaps (pages + projects): HTML routes from the sitemaps must match
  // the prerendered set exactly (no missing pages, no orphaned URLs).
  const pagesXml = await fs.readFile(path.join(OUT, "sitemap-pages.xml"), "utf8");
  const projectsXml = await fs.readFile(path.join(OUT, "sitemap-projects.xml"), "utf8");
  const sitemapRoutes = new Set(
    [...pagesXml.matchAll(/<loc>([^<]+)<\/loc>/g), ...projectsXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((m) => m[1].trim())
      .filter((u) => u === SITE_URL || u.startsWith(`${SITE_URL}/`))
      .map((u) => {
        const p = u.slice(SITE_URL.length) || "/";
        return p === "" ? "/" : p;
      })
      .filter((p) => !/\.[a-z0-9]+$/i.test(p)),
  );
  for (const r of expected) {
    if (!sitemapRoutes.has(r)) errors.push(`route missing from sitemaps: ${r}`);
  }
  for (const r of sitemapRoutes) {
    if (!expected.has(r)) errors.push(`sitemaps list unrendered route: ${r}`);
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

function isAllowedSiteUrl(rawUrl) {
  try {
    const expectedOrigin = new URL(SITE_URL).origin;
    const parsed = new URL(rawUrl);
    return parsed.origin === expectedOrigin;
  } catch {
    return false;
  }
}

function htmlReferencesSiteUrl(html) {
  const absoluteUrlRegex = /\bhttps?:\/\/[^\s"'<>]+/gi;
  const candidates = html.match(absoluteUrlRegex) ?? [];
  return candidates.some((u) => isAllowedSiteUrl(u));
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
      if (!htmlReferencesSiteUrl(html)) {
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
        if (!isAllowedSiteUrl(url)) {
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
