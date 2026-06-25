#!/usr/bin/env bun
/**
 * Build the static GitHub Pages mirror - Debug Version
 * This version helps identify what's being built and where
 */

import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DIST_CLIENT = path.join(ROOT, "dist", "client");
const OUT = path.join(ROOT, ".output", "public");
const SITE_URL = process.env.SITE_URL || "https://sthololwaziprojects.lovable.app";

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

// Debug function to examine build output
async function debugBuildOutput() {
  log("=== DEBUG: Examining build output ===", "DEBUG");
  
  // Check if dist exists
  try {
    const distExists = await fs.access(ROOT + "/dist").then(() => true).catch(() => false);
    log(`dist directory exists: ${distExists}`, "DEBUG");
    
    if (distExists) {
      const files = await fs.readdir(ROOT + "/dist");
      log(`dist contents: ${files.join(", ")}`, "DEBUG");
      
      // Check for server directory
      try {
        const serverFiles = await fs.readdir(ROOT + "/dist/server");
        log(`dist/server contents: ${serverFiles.join(", ")}`, "DEBUG");
      } catch {
        log("dist/server directory not found", "DEBUG");
      }
    }
  } catch (err) {
    log(`Debug error: ${err.message}`, "DEBUG");
  }
  
  // Check for nitro output
  try {
    const nitroExists = await fs.access(ROOT + "/.nitro").then(() => true).catch(() => false);
    log(`.nitro directory exists: ${nitroExists}`, "DEBUG");
    
    if (nitroExists) {
      const nitroFiles = await fs.readdir(ROOT + "/.nitro");
      log(`.nitro contents: ${nitroFiles.join(", ")}`, "DEBUG");
    }
  } catch (err) {
    log(`Nitro debug error: ${err.message}`, "DEBUG");
  }
  
  // Check for .output
  try {
    const outputExists = await fs.access(ROOT + "/.output").then(() => true).catch(() => false);
    log(`.output directory exists: ${outputExists}`, "DEBUG");
    
    if (outputExists) {
      const outputFiles = await fs.readdir(ROOT + "/.output");
      log(`.output contents: ${outputFiles.join(", ")}`, "DEBUG");
    }
  } catch (err) {
    log(`Output debug error: ${err.message}`, "DEBUG");
  }
}

async function findServerModule() {
  // More comprehensive search
  const candidates = [
    // Standard Vite SSR output
    path.join(ROOT, "dist", "server", "index.mjs"),
    path.join(ROOT, "dist", "server", "index.js"),
    path.join(ROOT, "dist", "server", "entry.mjs"),
    path.join(ROOT, "dist", "server", "entry.js"),
    
    // Nitro output
    path.join(ROOT, ".nitro", "server", "index.mjs"),
    path.join(ROOT, ".nitro", "server", "index.js"),
    
    // .output directory
    path.join(ROOT, ".output", "server", "index.mjs"),
    path.join(ROOT, ".output", "server", "index.js"),
    
    // Vercel output
    path.join(ROOT, ".vercel", "output", "server", "index.mjs"),
    path.join(ROOT, ".vercel", "output", "server", "index.js"),
    
    // Cloudflare output
    path.join(ROOT, "dist", "_worker.js"),
    path.join(ROOT, "dist", "worker.js"),
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

async function buildProject() {
  log("Starting build process...", "BUILD");
  
  // Try to read package.json to determine build command
  try {
    const pkg = JSON.parse(await fs.readFile(path.join(ROOT, "package.json"), "utf8"));
    log(`Package.json scripts: ${Object.keys(pkg.scripts || {}).join(", ")}`, "BUILD");
  } catch (err) {
    log(`Could not read package.json: ${err.message}`, "WARN");
  }
  
  // Try multiple build strategies
  const strategies = [
    // Try the standard build first
    { cmd: "bun", args: ["run", "build"] },
    // Try Vite directly
    { cmd: "bun", args: ["x", "vite", "build"] },
    // Try npm
    { cmd: "npm", args: ["run", "build"] },
    // Try nitro if available
    { cmd: "bun", args: ["x", "nitro", "build"] },
  ];
  
  let lastError = null;
  
  for (const strategy of strategies) {
    try {
      log(`Trying build: ${strategy.cmd} ${strategy.args.join(" ")}`, "BUILD");
      await exec(strategy.cmd, strategy.args);
      log(`Build succeeded with: ${strategy.cmd} ${strategy.args.join(" ")}`, "BUILD");
      
      // After build, check what was created
      await debugBuildOutput();
      return;
    } catch (err) {
      lastError = err;
      log(`Build failed: ${strategy.cmd} ${strategy.args.join(" ")}`, "WARN");
    }
  }
  
  throw new Error(`All build strategies failed. Last error: ${lastError?.message || "unknown"}`);
}

async function createBasicStaticSite() {
  log("Creating basic static site...", "STATIC");
  
  // Create index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sthololwazi Projects</title>
  <meta name="description" content="Sthololwazi Projects - Civil & Building Construction" />
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #1a1a1a; }
    h1 { color: #C99A3B; }
    .hero { background: #1a1a1a; color: white; padding: 40px; border-radius: 12px; margin-bottom: 30px; }
    .gold { color: #C99A3B; }
  </style>
</head>
<body>
  <div class="hero">
    <h1>Sthololwazi Projects</h1>
    <p>Building infrastructure. <span class="gold">Empowering</span> communities.</p>
    <p>Civil & Building Construction · Mbombela, Mpumalanga</p>
  </div>
  <h2>Services</h2>
  <ul>
    <li>Civil Construction</li>
    <li>Building Construction</li>
    <li>Material Supply</li>
  </ul>
  <p><a href="https://sthololwaziprojects.lovable.app">View full site →</a></p>
</body>
</html>`;
  
  await writeFile("index.html", indexHtml);
  await writeFile("404.html", indexHtml);
  await fs.writeFile(path.join(OUT, ".nojekyll"), "");
  
  // Create robots.txt
  await writeFile("robots.txt", `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`);
  
  // Create simple sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`;
  await writeFile("sitemap.xml", sitemap);
  
  log("Basic static site created", "STATIC");
}

async function main() {
  try {
    log("🚀 Starting build with debug", "START");
    
    // First, check what's already there
    await debugBuildOutput();
    
    // 1. Build the project
    await buildProject();
    
    // 2. Find server module
    const serverPath = await findServerModule();
    if (!serverPath) {
      log("No server module found! Creating static fallback.", "WARN");
      
      // Setup output directory
      await fs.rm(OUT, { recursive: true, force: true });
      await fs.mkdir(OUT, { recursive: true });
      
      // Copy client assets if they exist
      try {
        await fs.access(DIST_CLIENT);
        await copyDir(DIST_CLIENT, OUT);
        log("Copied client assets", "COPY");
      } catch {
        log("No client assets found", "WARN");
      }
      
      // Create static site
      await createBasicStaticSite();
      
      log("✅ Static site created successfully", "DONE");
      return;
    }
    
    // 3. Try to load and use the worker
    log(`Attempting to load worker from: ${serverPath}`, "WORKER");
    
    try {
      const workerUrl = pathToFileURL(serverPath).href;
      const mod = await import(workerUrl);
      const worker = mod.default ?? mod;
      
      if (typeof worker?.fetch === "function") {
        log("Worker loaded successfully with fetch handler", "WORKER");
        
        // Setup output directory
        await fs.rm(OUT, { recursive: true, force: true });
        await fs.mkdir(OUT, { recursive: true });
        
        // Copy client assets
        try {
          await fs.access(DIST_CLIENT);
          await copyDir(DIST_CLIENT, OUT);
          log("Copied client assets", "COPY");
        } catch {
          log("No client assets found", "WARN");
        }
        
        // Render routes
        const routes = ["/", "/about", "/services", "/projects", "/contact"];
        let renderedCount = 0;
        
        for (const route of routes) {
          try {
            const url = `${SITE_URL}${route}`;
            const req = new Request(url);
            const res = await worker.fetch(req);
            
            if (res && res.status < 400) {
              const html = await res.text();
              const outPath = route === "/" ? "index.html" : path.join(route.replace(/^\//, ""), "index.html");
              await writeFile(outPath, html);
              renderedCount++;
              log(`✓ Rendered ${route}`, "RENDER");
            } else {
              log(`✗ Failed to render ${route}: ${res?.status || "no response"}`, "WARN");
            }
          } catch (err) {
            log(`✗ Error rendering ${route}: ${err.message}`, "ERROR");
          }
        }
        
        log(`Rendered ${renderedCount}/${routes.length} routes`, "RENDER");
        
        // Create 404
        try {
          const indexHtml = await fs.readFile(path.join(OUT, "index.html"), "utf8");
          await writeFile("404.html", indexHtml);
        } catch {
          await createBasicStaticSite();
        }
        
        // GitHub Pages setup
        await fs.writeFile(path.join(OUT, ".nojekyll"), "");
        
        log("✅ Build complete with SSR", "DONE");
      } else {
        log("Worker has no fetch handler, creating static site", "WARN");
        await createBasicStaticSite();
      }
    } catch (err) {
      log(`Failed to use worker: ${err.message}`, "ERROR");
      await createBasicStaticSite();
    }
    
  } catch (err) {
    log(`❌ Build failed: ${err.message}`, "ERROR");
    console.error(err.stack);
    process.exit(1);
  }
}

main();
