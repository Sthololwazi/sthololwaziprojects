#!/usr/bin/env bun
/**
 * Build the static GitHub Pages mirror - Complete Working Version
 * This version ensures all required files are generated
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

// Core routes that must exist
const STATIC_ROUTES = ["/", "/about", "/services", "/projects", "/contact"];

function log(msg, type = "INFO") {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${msg}`);
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
    path.join(ROOT, ".nitro", "server", "index.mjs"),
    path.join(ROOT, ".output", "server", "index.mjs"),
    path.join(ROOT, "dist", "_worker.js"),
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

async function loadWorker(serverPath) {
  try {
    const workerUrl = pathToFileURL(serverPath).href;
    const mod = await import(workerUrl);
    const worker = mod.default ?? mod;
    
    if (typeof worker?.fetch === "function") {
      log("Worker loaded successfully", "WORKER");
      return worker;
    }
    return null;
  } catch (err) {
    log(`Failed to load worker: ${err.message}`, "ERROR");
    return null;
  }
}

async function buildProject() {
  log("Starting build process...", "BUILD");
  
  const strategies = [
    { cmd: "bun", args: ["run", "build"] },
    { cmd: "bun", args: ["x", "vite", "build"] },
    { cmd: "npm", args: ["run", "build"] },
  ];
  
  for (const strategy of strategies) {
    try {
      await exec(strategy.cmd, strategy.args);
      log(`Build succeeded with: ${strategy.cmd} ${strategy.args.join(" ")}`, "BUILD");
      return;
    } catch (err) {
      log(`Build failed: ${strategy.cmd} ${strategy.args.join(" ")}`, "WARN");
    }
  }
  
  throw new Error("All build strategies failed");
}

// Generate sitemaps directly without importing from src
function generateSitemaps(routes) {
  log("Generating sitemaps...", "SITEMAP");
  
  const now = new Date().toISOString();
  
  // Main sitemap index
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-pages.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-projects.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

  // Pages sitemap (static routes)
  const pagesSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${now}</lastmod>
    <priority>${route === "/" ? "1.0" : "0.8"}</priority>
    <changefreq>weekly</changefreq>
  </url>`).join("\n")}
</urlset>`;

  // Projects sitemap (will be populated from data if available)
  let projectsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

  // Try to get dynamic projects
  try {
    const projectRoutes = routes.filter(r => r.startsWith("/projects/"));
    if (projectRoutes.length > 0) {
      projectsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${projectRoutes.map(route => `  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${now}</lastmod>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
  </url>`).join("\n")}
</urlset>`;
    }
  } catch (err) {
    log(`Could not generate project sitemap: ${err.message}`, "WARN");
  }

  return { sitemapIndex, pagesSitemap, projectsSitemap };
}

async function getDynamicRoutes() {
  const routes = [];
  
  try {
    // Try to import slugs from src
    const slugsPath = path.join(ROOT, "src/data/slugs.ts");
    try {
      await fs.access(slugsPath);
      const slugsMod = await import(pathToFileURL(slugsPath).href);
      
      if (slugsMod.serviceSlugs) {
        routes.push(...slugsMod.serviceSlugs.map(s => `/services/${s}`));
      }
      if (slugsMod.projectSlugs) {
        routes.push(...slugsMod.projectSlugs.map(s => `/projects/${s}`));
      }
    } catch {
      log("No slugs.ts found, using static routes only", "WARN");
    }
  } catch (err) {
    log(`Could not load dynamic routes: ${err.message}`, "WARN");
  }
  
  return routes;
}

async function renderRoutes(worker, routes) {
  log(`Rendering ${routes.length} routes...`, "RENDER");
  
  const results = { success: [], failed: [] };
  
  for (const route of routes) {
    try {
      const url = `${SITE_URL}${route}`;
      const req = new Request(url, {
        method: "GET",
        headers: { "User-Agent": "static-builder/1.0" }
      });
      
      const res = await worker.fetch(req);
      
      if (res && res.status < 400) {
        const html = await res.text();
        const outPath = route === "/" ? "index.html" : path.join(route.replace(/^\//, ""), "index.html");
        await writeFile(outPath, html);
        results.success.push(route);
        log(`✓ Rendered ${route}`, "RENDER");
      } else {
        results.failed.push({ route, status: res?.status });
        log(`✗ Failed ${route}: ${res?.status}`, "WARN");
      }
    } catch (err) {
      results.failed.push({ route, error: err.message });
      log(`✗ Error ${route}: ${err.message}`, "ERROR");
    }
  }
  
  return results;
}

async function createFallbackPages(routes) {
  log("Creating fallback pages...", "FALLBACK");
  
  const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sthololwazi Projects</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { color: #C99A3B; }
    .nav { display: flex; gap: 20px; margin: 20px 0; }
    .nav a { color: #C99A3B; text-decoration: none; }
    .nav a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Sthololwazi Projects</h1>
  <p>Building infrastructure. Empowering communities.</p>
  <div class="nav">
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/services">Services</a>
    <a href="/projects">Projects</a>
    <a href="/contact">Contact</a>
  </div>
  <p><em>This is a fallback page. The full site is available at <a href="https://sthololwaziprojects.lovable.app">sthololwaziprojects.lovable.app</a></em></p>
</body>
</html>`;

  for (const route of routes) {
    const outPath = route === "/" ? "index.html" : path.join(route.replace(/^\//, ""), "index.html");
    await writeFile(outPath, fallbackHtml);
  }
}

async function main() {
  try {
    log("🚀 Starting static mirror build", "START");
    
    // 1. Build the project
    await buildProject();
    
    // 2. Setup output directory
    await fs.rm(OUT, { recursive: true, force: true });
    await fs.mkdir(OUT, { recursive: true });
    
    // 3. Copy client assets
    try {
      await fs.access(DIST_CLIENT);
      await copyDir(DIST_CLIENT, OUT);
      log("Copied client assets", "COPY");
    } catch {
      log("No client assets found", "WARN");
    }
    
    // 4. Get all routes
    const dynamicRoutes = await getDynamicRoutes();
    const allRoutes = [...STATIC_ROUTES, ...dynamicRoutes];
    log(`Total routes: ${allRoutes.length}`, "ROUTES");
    
    // 5. Generate sitemaps (do this regardless of SSR)
    const { sitemapIndex, pagesSitemap, projectsSitemap } = generateSitemaps(allRoutes);
    await writeFile("sitemap.xml", sitemapIndex);
    await writeFile("sitemap-pages.xml", pagesSitemap);
    await writeFile("sitemap-projects.xml", projectsSitemap);
    log("✓ Generated all sitemaps", "SITEMAP");
    
    // 6. Create robots.txt
    await writeFile("robots.txt", `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`);
    log("✓ Created robots.txt", "ROBOTS");
    
    // 7. Try SSR with worker
    const serverPath = await findServerModule();
    let renderedCount = 0;
    
    if (serverPath) {
      const worker = await loadWorker(serverPath);
      if (worker) {
        const results = await renderRoutes(worker, allRoutes);
        renderedCount = results.success.length;
        log(`Rendered ${renderedCount}/${allRoutes.length} routes with SSR`, "RENDER");
        
        // Create 404 from index
        try {
          const indexHtml = await fs.readFile(path.join(OUT, "index.html"), "utf8");
          await writeFile("404.html", indexHtml);
        } catch {
          await writeFile("404.html", pagesSitemap); // fallback
        }
      }
    }
    
    // 8. If SSR failed or rendered nothing, create fallback
    if (renderedCount === 0) {
      log("No routes rendered with SSR, creating fallback pages", "WARN");
      await createFallbackPages(allRoutes);
      
      // Create 404
      try {
        const indexHtml = await fs.readFile(path.join(OUT, "index.html"), "utf8");
        await writeFile("404.html", indexHtml);
      } catch {
        await writeFile("404.html", "404 - Page Not Found");
      }
    }
    
    // 9. GitHub Pages setup
    await fs.writeFile(path.join(OUT, ".nojekyll"), "");
    log("✓ Created .nojekyll", "GH-PAGES");
    
    // 10. Final verification
    const files = await fs.readdir(OUT);
    const requiredFiles = ["index.html", "404.html", "sitemap.xml", "sitemap-pages.xml", "sitemap-projects.xml", "robots.txt", ".nojekyll"];
    const missingFiles = requiredFiles.filter(f => !files.includes(f));
    
    if (missingFiles.length === 0) {
      log("✅ All required files present!", "VERIFY");
    } else {
      log(`⚠️ Missing files: ${missingFiles.join(", ")}`, "WARN");
    }
    
    log("✅ Build complete!", "DONE");
    
  } catch (err) {
    log(`❌ Build failed: ${err.message}`, "ERROR");
    console.error(err.stack);
    process.exit(1);
  }
}

main();
