#!/usr/bin/env node
/**
 * Post-build step for the GitHub Pages static mirror.
 *
 * Tanstack Start's primary build targets Cloudflare Workers (SSR + dynamic
 * server routes). GitHub Pages only serves static files, so after the Vite
 * client build we materialise everything that was previously served by
 * server routes:
 *
 *   - dist/.nojekyll              → stop GH Pages from stripping _* paths
 *   - dist/404.html               → SPA fallback so deep links don't 404
 *   - dist/robots.txt             → already shipped via public/, no-op
 *   - dist/sitemap.xml            → sitemap index
 *   - dist/sitemap-pages.xml      → static routes
 *   - dist/sitemap-projects.xml   → one entry per project
 *   - dist/api/og/projects/<slug>.svg → static OG image per project
 *
 * Data is extracted from src/data/{projects,services}.ts with a small regex
 * pass rather than executing the TS modules (they import Vite-aliased image
 * assets that only resolve inside the bundler).
 */

import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOT = process.cwd();
const DIST = join(ROOT, "dist");
const BASE_URL = process.env.PUBLIC_SITE_URL || "https://sthololwaziprojects.lovable.app";
// GH Pages serves under /sthololwazi/, so internal links inside generated
// XML/HTML need that prefix. Keep no trailing slash.
const PATH_PREFIX = (process.env.GH_PAGES_BASE || "/sthololwazi").replace(/\/$/, "");

if (!existsSync(DIST)) {
  console.error(`[gh-pages-postbuild] dist/ not found — run \`vite build\` first`);
  process.exit(1);
}

const ensureDir = (p) => mkdirSync(dirname(p), { recursive: true });
const write = (rel, body) => {
  const full = join(DIST, rel);
  ensureDir(full);
  writeFileSync(full, body);
  console.log(`  wrote ${rel}`);
};

// ---------------------------------------------------------------- data load
function readObjectsFromArray(filePath, fields) {
  const src = readFileSync(filePath, "utf8");
  // Match each `{ ... }` block inside the exported array. The data files only
  // use plain object literals, so a balanced-brace scanner is enough.
  const out = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        const block = src.slice(start, i + 1);
        const row = {};
        for (const field of fields) {
          const re = new RegExp(`${field}\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
          const m = block.match(re);
          if (m) row[field] = m[1].replace(/\\"/g, '"');
        }
        if (row.slug) out.push(row);
        start = -1;
      }
    }
  }
  return out;
}

const projects = readObjectsFromArray(
  join(ROOT, "src/data/projects.ts"),
  ["slug", "name", "category", "year", "location"],
);
const services = readObjectsFromArray(
  join(ROOT, "src/data/services.ts"),
  ["slug", "title"],
);

console.log(`[gh-pages-postbuild] ${projects.length} projects, ${services.length} services`);

// --------------------------------------------------------- SPA + GH Pages
write(".nojekyll", "");
copyFileSync(join(DIST, "index.html"), join(DIST, "404.html"));
console.log("  wrote 404.html (SPA fallback)");

// -------------------------------------------------------------- sitemaps
const now = new Date().toISOString();

const staticEntries = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/services", changefreq: "monthly", priority: "0.9" },
  ...services.map((s) => ({
    path: `/services/${s.slug}`,
    changefreq: "monthly",
    priority: "0.8",
  })),
  { path: "/projects", changefreq: "monthly", priority: "0.9" },
  { path: "/contact", changefreq: "yearly", priority: "0.7" },
];

const url = (p) => `${BASE_URL}${PATH_PREFIX}${p}`;
const xmlEscape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

write(
  "sitemap-pages.xml",
  [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...staticEntries.map(
      (e) =>
        `  <url><loc>${url(e.path)}</loc><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`,
    ),
    `</urlset>`,
  ].join("\n"),
);

write(
  "sitemap-projects.xml",
  [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
    ...projects.map(
      (p) =>
        `  <url><loc>${url(`/projects/${p.slug}`)}</loc><changefreq>monthly</changefreq><priority>0.7</priority><image:image><image:loc>${url(`/api/og/projects/${p.slug}.svg`)}</image:loc><image:title>${xmlEscape(p.name || "")}</image:title></image:image></url>`,
    ),
    `</urlset>`,
  ].join("\n"),
);

write(
  "sitemap.xml",
  [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    `  <sitemap><loc>${url("/sitemap-pages.xml")}</loc><lastmod>${now}</lastmod></sitemap>`,
    `  <sitemap><loc>${url("/sitemap-projects.xml")}</loc><lastmod>${now}</lastmod></sitemap>`,
    `</sitemapindex>`,
  ].join("\n"),
);

// -------------------------------------------------------------- OG images
// Mirrors src/routes/api/og/projects.$slug.ts but as a one-shot static gen.
function renderOgSvg(p) {
  const esc = xmlEscape;
  const wrap = (text, max, maxLines) => {
    const words = String(text || "").split(/\s+/);
    const lines = [];
    let line = "";
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (next.length > max && line) {
        lines.push(line);
        line = w;
        if (lines.length === maxLines - 1) break;
      } else {
        line = next;
      }
    }
    if (line && lines.length < maxLines) lines.push(line);
    return lines;
  };
  const titleLines = wrap(p.name, 22, 3);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F2418"/>
      <stop offset="60%" stop-color="#1A5C2A"/>
      <stop offset="100%" stop-color="#0F2418"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1050" cy="120" r="280" fill="#C99A3B" fill-opacity="0.08"/>
  <circle cx="100" cy="560" r="220" fill="#C99A3B" fill-opacity="0.06"/>
  <g font-family="Inter, system-ui, sans-serif" fill="#ffffff">
    <text x="80" y="100" font-size="20" letter-spacing="6" fill="#C99A3B" font-weight="600">STHOLOLWAZI PROJECTS</text>
    <line x1="80" y1="120" x2="160" y2="120" stroke="#C99A3B" stroke-width="3"/>
    <text x="80" y="180" font-size="18" letter-spacing="4" fill="#C99A3B" font-weight="600">${esc((p.category || "PROJECT").toUpperCase())} · ${esc(p.year || "")}</text>
  </g>
  <g font-family="Fraunces, Georgia, serif" fill="#ffffff">
    ${titleLines
      .map(
        (l, i) =>
          `<text x="80" y="${280 + i * 86}" font-size="78" font-weight="400">${esc(l)}</text>`,
      )
      .join("\n    ")}
  </g>
  <g font-family="Inter, system-ui, sans-serif" fill="#ffffff" fill-opacity="0.78">
    <text x="80" y="555" font-size="22">${esc(p.location || "")}</text>
    <text x="80" y="588" font-size="18" fill-opacity="0.55">B-BBEE Level 1 · CIDB 10127071 · NHBRC 3000190954</text>
  </g>
</svg>`;
}

for (const p of projects) {
  write(`api/og/projects/${p.slug}.svg`, renderOgSvg(p));
}
// Default fallback so missing slugs still get a branded preview.
write(
  "api/og/projects/default.svg",
  renderOgSvg({
    name: "Sthololwazi Projects",
    category: "Construction",
    year: "Mpumalanga",
    location: "Building infrastructure. Empowering communities.",
  }),
);

console.log(`[gh-pages-postbuild] done`);
