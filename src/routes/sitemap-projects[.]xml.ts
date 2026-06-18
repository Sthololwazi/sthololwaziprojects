import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { projects } from "@/data/projects";

export const Route = createFileRoute("/sitemap-projects.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const urls = projects
          .map(
            (p) =>
              `  <url>\n    <loc>${origin}/projects/${p.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n    <image:image xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"><image:loc>${origin}/api/og/projects/${p.slug}.svg</image:loc><image:title>${p.name.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</image:title></image:image>\n  </url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
