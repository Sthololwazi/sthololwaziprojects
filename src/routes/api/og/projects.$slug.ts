import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getProject } from "@/data/projects";

export const Route = createFileRoute("/api/og/projects/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const p = getProject(params.slug);
        if (!p) return new Response("Not found", { status: 404 });

        const esc = (s: string) =>
          s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // Wrap long titles across up to 3 lines.
        const wrap = (text: string, max: number, maxLines: number) => {
          const words = text.split(/\s+/);
          const lines: string[] = [];
          let line = "";
          for (const w of words) {
            const next = line ? `${line} ${w}` : w;
            if (next.length > max && line) {
              lines.push(line);
              line = w;
              if (lines.length === maxLines - 1) break;
            } else {
              line = next;
            }
          }
          if (line && lines.length < maxLines) lines.push(line);
          if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
            lines[maxLines - 1] = lines[maxLines - 1].replace(/.{0,3}$/, "…");
          }
          return lines;
        };

        const titleLines = wrap(p.name, 22, 3);

        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F2418"/>
      <stop offset="60%" stop-color="#1A5C2A"/>
      <stop offset="100%" stop-color="#0F2418"/>
    </linearGradient>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.45"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1050" cy="120" r="280" fill="#C99A3B" fill-opacity="0.08"/>
  <circle cx="100" cy="560" r="220" fill="#C99A3B" fill-opacity="0.06"/>
  <rect width="1200" height="630" fill="url(#vignette)"/>

  <g font-family="Inter, system-ui, sans-serif" fill="#ffffff">
    <text x="80" y="100" font-size="20" letter-spacing="6" fill="#C99A3B" font-weight="600">STHOLOLWAZI PROJECTS</text>
    <line x1="80" y1="120" x2="160" y2="120" stroke="#C99A3B" stroke-width="3"/>

    <text x="80" y="180" font-size="18" letter-spacing="4" fill="#C99A3B" font-weight="600">${esc(p.category.toUpperCase())} · ${esc(p.year)}</text>
  </g>

  <g font-family="Fraunces, Georgia, serif" fill="#ffffff">
    ${titleLines
      .map(
        (l, i) =>
          `<text x="80" y="${280 + i * 86}" font-size="78" font-weight="400">${esc(l)}</text>`,
      )
      .join("\n    ")}
  </g>

  <g font-family="Inter, system-ui, sans-serif" fill="#ffffff" fill-opacity="0.78">
    <text x="80" y="555" font-size="22">${esc(p.location)}</text>
    <text x="80" y="588" font-size="18" fill-opacity="0.55">B-BBEE Level 1 · CIDB 10127071 · NHBRC 3000190954</text>
  </g>

  <g transform="translate(960,500)" font-family="Inter, system-ui, sans-serif">
    <rect x="0" y="0" width="160" height="56" rx="28" fill="#C99A3B"/>
    <text x="80" y="36" text-anchor="middle" font-size="16" font-weight="600" fill="#1a1a1a" letter-spacing="2">REQUEST QUOTE</text>
  </g>
</svg>`;

        return new Response(svg, {
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      },
    },
  },
});
