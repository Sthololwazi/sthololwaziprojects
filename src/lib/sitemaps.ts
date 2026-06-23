// Sitemap XML generators. Shared between the server routes and the
// GitHub Pages static-mirror build script so both output identical XML.

import { SITE_URL } from "@/lib/site";
import { projects } from "@/data/projects";
import { services } from "@/data/services";

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function renderSitemapIndex(): string {
  const now = new Date().toISOString();
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    `  <sitemap><loc>${SITE_URL}/sitemap-pages.xml</loc><lastmod>${now}</lastmod></sitemap>`,
    `  <sitemap><loc>${SITE_URL}/sitemap-projects.xml</loc><lastmod>${now}</lastmod></sitemap>`,
    `</sitemapindex>`,
  ].join("\n");
}

interface PageEntry {
  path: string;
  changefreq: "weekly" | "monthly" | "yearly";
  priority: string;
}

export function renderPagesSitemap(): string {
  const entries: PageEntry[] = [
    { path: "/", priority: "1.0", changefreq: "weekly" },
    { path: "/about", priority: "0.8", changefreq: "monthly" },
    { path: "/services", priority: "0.9", changefreq: "monthly" },
    ...services.map((s) => ({
      path: `/services/${s.slug}`,
      priority: "0.8",
      changefreq: "monthly" as const,
    })),
    { path: "/projects", priority: "0.9", changefreq: "monthly" },
    { path: "/contact", priority: "0.7", changefreq: "yearly" },
  ];
  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${SITE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export function renderProjectsSitemap(): string {
  const urls = projects
    .map(
      (p) =>
        `  <url>\n    <loc>${SITE_URL}/projects/${p.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n    <image:image><image:loc>${SITE_URL}/api/og/projects/${p.slug}.svg</image:loc><image:title>${xmlEscape(p.name)}</image:title></image:image>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>`;
}
