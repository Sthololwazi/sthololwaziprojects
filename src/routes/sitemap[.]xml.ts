import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { renderSitemapIndex } from "@/lib/sitemaps";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(renderSitemapIndex(), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        }),
    },
  },
});
