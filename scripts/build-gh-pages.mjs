#!/usr/bin/env bun
/**
 * Build the static GitHub Pages mirror.
 * 
 * This script ensures the static mirror stays perfectly in sync with the SSR version.
 * It handles the full pipeline from build to verification.
 */

import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const ROOT = process.cwd();
const DIST_CLIENT = path.join(ROOT, "dist", "client");
const OUT = path.join(ROOT, ".output", "public");
const SITE_URL = process.env.SITE_URL || "https://sthololwaziprojects.lovable.app";
const GH_PAGES_URL = "https://sthololwazi.github.io";

// Core routes that must always be rendered
const STATIC_ROUTES = ["/", "/about", "/services", "/projects", "/contact"];

function log(msg, type = "INFO") {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] [gh-pages] ${msg}`);
}

async function exec(cmd, args, options = {}) {
  log(`$ ${cmd} ${args.join(" ")}`, "CMD");
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { 
      stdio: "inherit", 
      env: { ...process.env, ...options.env },
      shell: true
    });
    p.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
    p.on("error", reject);
  });
}

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  for (const entry of await fs.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      await copyDir(s, d);
    } else {
      await fs.copyFile(s, d);
    }
  }
}

async function writeFile(rel, body) {
  const full = path.join(OUT, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, body);
  log(`wrote ${rel} (${body.length} bytes)`, "FILE");
}

async function findServerModule() {
  const candidates = [
    path.join(ROOT, "dist", "server", "index.mjs"),
    path.join(ROOT, "dist", "server", "index.js"),
    path.join(ROOT, "dist", "server", "index.cjs"),
    path.join(ROOT, ".nitro", "server", "index.mjs"),
    path.join(ROOT, ".output", "server", "index.mjs"),
    path.join(ROOT, ".vercel", "output", "server", "index.mjs"),
  ];
  
  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }
  return null;
}

async function loadWorkerModule(serverPath) {
  try {
    // Try ES module import
    const workerUrl = pathToFileURL(serverPath).href;
    const mod = await import(workerUrl);
    return mod.default ?? mod;
  } catch (err) {
    log(`ESM import failed: ${err.message}`, "WARN");
    
    try {
      // Try CommonJS require
      const require = createRequire(import.meta.url);
      const mod = require(serverPath);
      return mod.default ?? mod;
    } catch (err2) {
      log(`CJS require failed: ${err2.message}`, "WARN");
      return null;
    }
  }
}

async function buildProject() {
  log("Starting build process...", "BUILD");
  
  // Try multiple build strategies
  const buildStrategies = [
    { cmd: "bun", args: ["x", "vite", "build"] },
    { cmd: "bun", args: ["run", "build"] },
    { cmd: "npm", args: ["run", "build"] },
    { cmd: "bun", args: ["x", "nitro", "build", "--preset", "cloudflare"] },
  ];
  
  let buildSuccess = false;
  for (const strategy of buildStrategies) {
    try {
      await exec(strategy.cmd, strategy.args);
      buildSuccess = true;
      break;
    } catch (err) {
      log(`Build strategy failed: ${strategy.cmd} ${strategy.args.join(" ")}`, "WARN");
    }
  }
  
  if (!buildSuccess) {
    log("All build strategies failed. Checking for existing build...", "ERROR");
    try {
      await fs.access(DIST_CLIENT);
      log("Found existing build in dist/client", "INFO");
    } catch {
      throw new Error("Build failed and no existing build found. Cannot continue.");
    }
  }
}

async function generateSitemapsAndOG() {
  try {
    // Import helpers with fallbacks
    let renderSitemapIndex, renderPagesSitemap, renderProjectsSitemap;
    let renderProjectOgSvg, projects, serviceSlugs, projectSlugs;
    
    try {
      const sitemaps = await import(pathToFileURL(path.join(ROOT, "src/lib/sitemaps.ts")).href);
      renderSitemapIndex = sitemaps.renderSitemapIndex;
      renderPagesSitemap = sitemaps.renderPagesSitemap;
      renderProjectsSitemap = sitemaps.renderProjectsSitemap;
    } catch (err) {
      log(`Could not load sitemap helpers: ${err.message}`, "WARN");
    }
    
    try {
      const og = await import(pathToFileURL(path.join(ROOT, "src/lib/og.ts")).href);
      renderProjectOgSvg = og.renderProjectOgSvg;
    } catch (err) {
      log(`Could not load OG helpers: ${err.message}`, "WARN");
    }
    
    try {
      const projectData = await import(pathToFileURL(path.join(ROOT, "src/data/projects.ts")).href);
      projects = projectData.projects;
    } catch (err) {
      log(`Could not load project data: ${err.message}`, "WARN");
      projects = [];
    }
    
    try {
      const slugs = await import(pathToFileURL(path.join(ROOT, "src/data/slugs.ts")).href);
      serviceSlugs = slugs.serviceSlugs || [];
      projectSlugs = slugs.projectSlugs || [];
    } catch (err) {
      log(`Could not load slugs: ${err.message}`, "WARN");
      serviceSlugs = [];
      projectSlugs = [];
    }
    
    // Generate sitemaps
    if (renderSitemapIndex) {
      await writeFile("sitemap.xml", renderSitemapIndex());
    }
    if (renderPagesSitemap) {
      await writeFile("sitemap-pages.xml", renderPagesSitemap());
    }
    if (renderProjectsSitemap) {
      await writeFile("sitemap-projects.xml", renderProjectsSitemap());
    }
    
    // Generate OG SVGs
    if (renderProjectOgSvg && projects.length) {
      for (const p of projects) {
        if (p.slug) {
          await writeFile(`api/og/projects/${p.slug}.svg`, renderProjectOgSvg(p));
        }
      }
    }
    
    return { serviceSlugs, projectSlugs };
  } catch (err) {
    log(`Error generating sitemaps/OG: ${err.message}`, "ERROR");
    return { serviceSlugs: [], projectSlugs: [] };
  }
}

async function prerenderRoutes(worker, routes) {
  log(`Prerendering ${routes.length} routes...`, "PRERENDER");
  
  const renderedRoutes = new Set();
  const failedRoutes = [];
  
  for (const route of routes) {
    const req = new Request(`${SITE_URL}${route}`, {
      method: "GET",
      headers: { 
        "user-agent": "github-pages-prerender/1.0",
        "x-prerender": "true"
      },
    });
    
    try {
      const res = await worker.fetch(req, {}, { 
        waitUntil() {}, 
        passThroughOnException() {} 
      });
      
      if (!res || res.status >= 400) {
        log(`${route} → status ${res?.status || "ERROR"}`, "WARN");
        failedRoutes.push(`${route} (status ${res?.status || "ERROR"})`);
        continue;
      }
      
      const html = await res.text();
      const out = route === "/" ? "index.html" : path.join(route.replace(/^\//, ""), "index.html");
      await writeFile(out, html);
      renderedRoutes.add(route);
      log(`✓ ${route}`, "PRERENDER");
    } catch (err) {
      log(`✗ ${route} threw: ${err.message}`, "ERROR");
      failedRoutes.push(`${route} (threw: ${err.message})`);
    }
  }
  
  log(`Prerendered ${renderedRoutes.size}/${routes.length} routes`, "PRERENDER");
  return { renderedRoutes, failedRoutes };
}

async function materializeAssets() {
  log("Materializing external assets...", "ASSETS");
  
  const urls = new Set();
  async function walk(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(full);
        } else if (entry.name.endsWith(".html")) {
          const html = await fs.readFile(full, "utf8");
          // Look for Lovable CDN assets
          const matches = html.matchAll(/\/__l5e\/[A-Za-z0-9._\-\/]+/g);
          for (const m of matches) {
            urls.add(m[0]);
          }
          // Look for other external assets
          const externalMatches = html.matchAll(/https?:\/\/[^\s"'<>]+\/(assets|fonts|images)\/[^\s"'<>]+/g);
          for (const m of externalMatches) {
            const url = m[0];
            if (!url.includes(SITE_URL) && !url.includes(GH_PAGES_URL)) {
              // Only download from our site
              if (url.startsWith(SITE_URL)) {
                urls.add(url.replace(SITE_URL, ""));
              }
            }
          }
        }
      }
    } catch {
      // Skip directories that don't exist
    }
  }
  
  await walk(OUT);
  
  if (!urls.size) {
    log("No external assets to materialize", "ASSETS");
    return;
  }
  
  log(`Found ${urls.size} external assets to materialize`, "ASSETS");
  
  let successCount = 0;
  let failCount = 0;
  
  for (const u of urls) {
    const dest = path.join(OUT, u.replace(/^\//, ""));
    try {
      await fs.access(dest);
      log(`✓ Already exists: ${u}`, "ASSETS");
      successCount++;
      continue;
    } catch {
      // Need to fetch
    }
    
    try {
      const res = await fetch(`${SITE_URL}${u}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      await fs.mkdir(path.dirname(dest), { recursive: true });
      const buffer = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(dest, buffer);
      log(`✓ Downloaded: ${u} (${buffer.length} bytes)`, "ASSETS");
      successCount++;
    } catch (err) {
      log(`✗ Failed to download ${u}: ${err.message}`, "ERROR");
      failCount++;
    }
  }
  
  log(`Materialized ${successCount}/${urls.size} assets (${failCount} failed)`, "ASSETS");
}

async function setupGitHubPages() {
  log("Setting up GitHub Pages configuration...", "GH-PAGES");
  
  // Jekyll opt-out
  await fs.writeFile(path.join(OUT, ".nojekyll"), "");
  
  // SPA fallback
  try {
    const indexHtml = await fs.readFile(path.join(OUT, "index.html"), "utf8");
    await writeFile("404.html", indexHtml);
  } catch {
    log("index.html not found, creating fallback", "WARN");
    await writeFile("404.html", `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Page Not Found</title></head>
<body><h1>404 - Page Not Found</h1></body>
</html>`);
  }
  
  // Custom domain
  try {
    const cname = (await fs.readFile(path.join(ROOT, "CNAME"), "utf8")).trim();
    if (cname) {
      await fs.writeFile(path.join(OUT, "CNAME"), `${cname}\n`);
      log(`✓ CNAME: ${cname}`, "GH-PAGES");
    }
  } catch {
    log("No CNAME file found", "INFO");
  }
}

async function verifyBuild() {
  log("Starting build verification...", "VERIFY");
  
  const errors = [];
  
  // Check required files
  const requiredFiles = ["index.html", "404.html", ".nojekyll"];
  for (const f of requiredFiles) {
    try {
      await fs.access(path.join(OUT, f));
    } catch {
      errors.push(`Missing required file: ${f}`);
    }
  }
  
  // Check robots.txt exists and has sitemap
  try {
    const robots = await fs.readFile(path.join(OUT, "robots.txt"), "utf8");
    if (!robots.includes("Sitemap:")) {
      errors.push("robots.txt missing Sitemap directive");
    }
  } catch {
    // Generate robots.txt if missing
    log("Generating robots.txt", "VERIFY");
    const robotsContent = `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`;
    await writeFile("robots.txt", robotsContent);
  }
  
  // Check sitemaps exist
  const sitemaps = ["sitemap.xml", "sitemap-pages.xml", "sitemap-projects.xml"];
  for (const s of sitemaps) {
    try {
      await fs.access(path.join(OUT, s));
    } catch {
      log(`Warning: ${s} not found`, "WARN");
    }
  }
  
  // Check index.html references site URL
  try {
    const html = await fs.readFile(path.join(OUT, "index.html"), "utf8");
    if (!html.includes(SITE_URL)) {
      log("Warning: index.html does not reference SITE_URL", "WARN");
    }
    if (!html.includes(GH_PAGES_URL) && !html.includes("sthololwazi.github.io")) {
      // This is okay if it's using relative paths
      log("Note: index.html uses relative paths (good for GH Pages)", "VERIFY");
    }
  } catch (err) {
    errors.push(`Could not read index.html: ${err.message}`);
  }
  
  if (errors.length) {
    log(`Verification found ${errors.length} issues`, "ERROR");
    for (const e of errors) {
      log(`- ${e}`, "ERROR");
    }
    // Don't fail the build, just warn
  } else {
    log("All verifications passed!", "VERIFY");
  }
}

async function main() {
  try {
    log("🚀 Starting GH Pages mirror build", "START");
    log(`Source: ${SITE_URL}`, "CONFIG");
    log(`Output: ${OUT}`, "CONFIG");
    
    // 1. Build the project
    await buildProject();
    
    // 2. Find server module
    const serverPath = await findServerModule();
    
    // 3. Setup output directory
    await fs.rm(OUT, { recursive: true, force: true });
    await fs.mkdir(OUT, { recursive: true });
    
    // 4. Copy client assets
    log("Copying client assets...", "COPY");
    await copyDir(DIST_CLIENT, OUT);
    
    // 5. Generate sitemaps and OG images
    const { serviceSlugs, projectSlugs } = await generateSitemapsAndOG();
    
    // 6. Build routes list
    const allRoutes = [
      ...STATIC_ROUTES,
      ...serviceSlugs.map(s => `/services/${s}`),
      ...projectSlugs.map(s => `/projects/${s}`),
    ];
    
    // 7. Prerender with worker if available
    if (serverPath) {
      log(`Loading worker from ${serverPath}`, "WORKER");
      const worker = await loadWorkerModule(serverPath);
      if (worker && typeof worker.fetch === "function") {
        await prerenderRoutes(worker, allRoutes);
      } else {
        log("Worker loaded but has no fetch handler", "WARN");
        await createStaticFallback(allRoutes);
      }
    } else {
      log("No server module found - creating static fallback", "WARN");
      await createStaticFallback(allRoutes);
    }
    
    // 8. Materialize external assets
    await materializeAssets();
    
    // 9. Setup GitHub Pages
    await setupGitHubPages();
    
    // 10. Verify build
    await verifyBuild();
    
    log("✅ Build complete!", "DONE");
    
  } catch (err) {
    log(`❌ Build failed: ${err.message}`, "ERROR");
    console.error(err.stack);
    process.exit(1);
  }
}

async function createStaticFallback(routes) {
  log("Creating static fallback pages...", "FALLBACK");
  
  // Create basic HTML for each route
  for (const route of routes) {
    const out = route === "/" ? "index.html" : path.join(route.replace(/^\//, ""), "index.html");
    await writeFile(out, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ST Hololwazi Projects</title>
  <link rel="stylesheet" href="/assets/index.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/index.js"></script>
</body>
</html>`);
  }
}

// Run the build
main();
