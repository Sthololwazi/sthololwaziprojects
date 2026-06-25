#!/usr/bin/env bun
/**
 * Build the static GitHub Pages mirror - Complete Working Version
 * 
 * This script properly handles SSR and creates a full static mirror
 * with all content, assets, and routes.
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

// All routes that need to be rendered
const ALL_ROUTES = [
  "/",
  "/about",
  "/services", 
  "/projects",
  "/contact",
  // Dynamic routes will be added from data
];

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
  ];
  
  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      log(`Found server module: ${candidate}`, "WORKER");
      return candidate;
    } catch {
      continue;
    }
  }
  return null;
}

async function loadWorker(serverPath) {
  try {
    // Try ES module import
    const workerUrl = pathToFileURL(serverPath).href;
    const mod = await import(workerUrl);
    const worker = mod.default ?? mod;
    
    if (typeof worker?.fetch === "function") {
      log("Worker loaded successfully with fetch handler", "WORKER");
      return worker;
    } else {
      log("Worker loaded but has no fetch handler", "ERROR");
      return null;
    }
  } catch (err) {
    log(`Failed to load worker: ${err.message}`, "ERROR");
    log(`Stack: ${err.stack}`, "ERROR");
    return null;
  }
}

async function buildProject() {
  log("Starting build process...", "BUILD");
  
  // Try multiple build strategies
  const strategies = [
    { cmd: "bun", args: ["x", "vite", "build"] },
    { cmd: "bun", args: ["run", "build"] },
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

async function getDynamicRoutes() {
  const routes = [];
  
  try {
    // Try to import slugs
    const slugsPath = path.join(ROOT, "src/data/slugs.ts");
    const slugsMod = await import(pathToFileURL(slugsPath).href);
    
    if (slugsMod.serviceSlugs) {
      routes.push(...slugsMod.serviceSlugs.map(s => `/services/${s}`));
      log(`Found ${slugsMod.serviceSlugs.length} service routes`, "ROUTES");
    }
    
    if (slugsMod.projectSlugs) {
      routes.push(...slugsMod.projectSlugs.map(s => `/projects/${s}`));
      log(`Found ${slugsMod.projectSlugs.length} project routes`, "ROUTES");
    }
  } catch (err) {
    log(`Could not load slugs: ${err.message}`, "WARN");
  }
  
  return routes;
}

async function renderWithWorker(worker, routes) {
  log(`Rendering ${routes.length} routes with worker...`, "RENDER");
  
  const results = [];
  
  for (const route of routes) {
    try {
      const url = `${SITE_URL}${route}`;
      log(`Rendering: ${url}`, "RENDER");
      
      const req = new Request(url, {
        method: "GET",
        headers: {
          "User-Agent": "static-builder/1.0",
          "Accept": "text/html",
        },
      });
      
      const res = await worker.fetch(req);
      
      if (!res || res.status >= 400) {
        log(`Failed to render ${route}: ${res?.status || "no response"}`, "ERROR");
        continue;
      }
      
      const html = await res.text();
      
      // Save the rendered HTML
      const outPath = route === "/" ? "index.html" : path.join(route.replace(/^\//, ""), "index.html");
      await writeFile(outPath, html);
      
      log(`✓ Rendered ${route} (${html.length} bytes)`, "RENDER");
      results.push({ route, success: true, length: html.length });
      
    } catch (err) {
      log(`✗ Failed to render ${route}: ${err.message}`, "ERROR");
      results.push({ route, success: false, error: err.message });
    }
  }
  
  return results;
}

async function createFallbackPage(title = "Sthololwazi Projects") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="Sthololwazi Projects - Civil & Building Construction" />
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #1a1a1a; }
    h1 { color: #C99A3B; }
    .loading { text-align: center; padding: 60px 20px; }
    .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #C99A3B; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="loading">
    <h1>Sthololwazi Projects</h1>
    <div class="spinner"></div>
    <p>Loading content...</p>
    <p><small>If this page doesn't load, please check your connection.</small></p>
  </div>
  <script>
    // Try to load the actual content
    fetch('/')
      .then(r => r.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const content = doc.querySelector('body').innerHTML;
        document.body.innerHTML = content;
      })
      .catch(() => {
        document.querySelector('.loading').innerHTML = '<h1>Loading Failed</h1><p>Please refresh the page or try again later.</p>';
      });
  </script>
</body>
</html>`;
}

async function main() {
  try {
    log("🚀 Starting full static mirror build", "START");
    
    // 1. Build the project
    await buildProject();
    
    // 2. Find and load worker
    const serverPath = await findServerModule();
    if (!serverPath) {
      throw new Error("No server module found! Build may have failed.");
    }
    
    const worker = await loadWorker(serverPath);
    if (!worker) {
      throw new Error("Failed to load worker module!");
    }
    
    // 3. Setup output directory
    await fs.rm(OUT, { recursive: true, force: true });
    await fs.mkdir(OUT, { recursive: true });
    
    // 4. Copy client assets first
    log("Copying client assets...", "COPY");
    await copyDir(DIST_CLIENT, OUT);
    
    // 5. Get all routes
    const dynamicRoutes = await getDynamicRoutes();
    const allRoutes = [...ALL_ROUTES, ...dynamicRoutes];
    log(`Total routes to render: ${allRoutes.length}`, "ROUTES");
    
    // 6. Render all routes
    const results = await renderWithWorker(worker, allRoutes);
    
    // 7. Check results
    const failed = results.filter(r => !r.success);
    const succeeded = results.filter(r => r.success);
    
    log(`Rendering complete: ${succeeded.length} succeeded, ${failed.length} failed`, "RENDER");
    
    if (failed.length > 0) {
      log("Failed routes:", "ERROR");
      failed.forEach(f => log(`  ${f.route}: ${f.error}`, "ERROR"));
    }
    
    // 8. Verify we have index.html
    try {
      await fs.access(path.join(OUT, "index.html"));
      log("✓ index.html exists", "VERIFY");
    } catch {
      log("Creating fallback index.html", "WARN");
      await writeFile("index.html", await createFallbackPage());
    }
    
    // 9. Create 404.html
    try {
      const indexHtml = await fs.readFile(path.join(OUT, "index.html"), "utf8");
      await writeFile("404.html", indexHtml);
    } catch {
      await writeFile("404.html", await createFallbackPage("Page Not Found"));
    }
    
    // 10. GitHub Pages setup
    await fs.writeFile(path.join(OUT, ".nojekyll"), "");
    log("✓ Created .nojekyll", "GH-PAGES");
    
    // 11. Create sitemap
    try {
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>${route === "/" ? "1.0" : "0.8"}</priority>
  </url>`).join("\n")}
</urlset>`;
      await writeFile("sitemap.xml", sitemap);
      log("✓ Created sitemap.xml", "SITEMAP");
    } catch (err) {
      log(`Failed to create sitemap: ${err.message}`, "WARN");
    }
    
    // 12. Create robots.txt
    await writeFile("robots.txt", `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`);
    log("✓ Created robots.txt", "ROBOTS");
    
    // 13. Final verification
    const files = await fs.readdir(OUT);
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    log(`Output contains ${htmlFiles.length} HTML files`, "VERIFY");
    
    // List all directories (routes)
    const dirs = [];
    async function listDirs(dir, prefix = "") {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
          dirs.push(rel);
          await listDirs(path.join(dir, entry.name), rel);
        }
      }
    }
    await listDirs(OUT);
    log(`Output contains ${dirs.length} directories`, "VERIFY");
    
    log("✅ Build complete!", "DONE");
    
  } catch (err) {
    log(`❌ Build failed: ${err.message}`, "ERROR");
    console.error(err.stack);
    process.exit(1);
  }
}

main();
