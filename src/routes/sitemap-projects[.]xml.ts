import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { renderProjectsSitemap } from "@/lib/sitemaps";

export const Route = createFileRoute("/sitemap-projects.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(renderProjectsSitemap(), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        }),
    },
  },
});
