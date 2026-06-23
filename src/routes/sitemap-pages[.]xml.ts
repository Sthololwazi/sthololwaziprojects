import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { renderPagesSitemap } from "@/lib/sitemaps";

export const Route = createFileRoute("/sitemap-pages.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(renderPagesSitemap(), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        }),
    },
  },
});
