import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getProject } from "@/data/projects";
import { OG_FALLBACK, renderProjectOgSvg } from "@/lib/og";

export const Route = createFileRoute("/api/og/projects/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        // Crawlers fetch this as `/api/og/projects/<slug>.svg` so the asset
        // looks like a real image file — strip the extension before lookup.
        const slug = params.slug.replace(/\.svg$/i, "");
        const p = getProject(slug) ?? OG_FALLBACK;
        const svg = renderProjectOgSvg(p);
        return new Response(svg, {
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control":
              "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000, immutable",
            "Content-Disposition": `inline; filename="${slug}.svg"`,
            "X-Content-Type-Options": "nosniff",
            Vary: "Accept",
          },
        });
      },
    },
  },
});
