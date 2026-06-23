import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { LogoWatermark } from "@/components/site/LogoWatermark";
import { projects, categories, type ProjectCategory } from "@/data/projects";
import { SITE_URL } from "@/lib/site";
import rdp from "@/assets/project-rdp.jpg";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Sthololwazi Projects · Track Record" },
      {
        name: "description",
        content:
          "Browse the Sthololwazi Projects portfolio — from a R53M national housing programme to hospital and school renovations across Mpumalanga.",
      },
      { property: "og:title", content: "Projects — Sthololwazi Projects" },
      {
        property: "og:description",
        content: "Community infrastructure, healthcare facilities and national housing delivery.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/projects` },
      { property: "og:image", content: `${SITE_URL}${rdp}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Projects — Sthololwazi Projects" },
      {
        name: "twitter:description",
        content: "A portfolio measured in homes built and lives changed.",
      },
      { name: "twitter:image", content: `${SITE_URL}${rdp}` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/projects` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Sthololwazi Projects portfolio",
          url: `${SITE_URL}/projects`,
          hasPart: projects.map((p) => ({
            "@type": "CreativeWork",
            name: p.name,
            url: `${SITE_URL}/projects/${p.slug}`,
          })),
        }),
      },
    ],
  }),
  component: Projects,
});

type Filter = "All" | ProjectCategory;

function Projects() {
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  );

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative pt-40 pb-16 container-page overflow-hidden">
        <LogoWatermark
          className="absolute -right-24 -top-12 w-[420px] hidden md:block"
          opacity={0.06}
        />
        <div className="relative">
          <div className="eyebrow">Projects</div>
          <h1 className="display-xl mt-6 max-w-4xl">
            A portfolio measured in <span className="italic-accent">homes built</span> and lives
            changed.
          </h1>
          <p className="mt-10 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            From the renovation of a community primary school to project management of 500 RDP
            houses — explore our track record across housing, healthcare, education, civil and
            commercial sectors.
          </p>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="container-page pt-4 pb-10 sticky top-20 z-30 bg-background/85 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          {(["All", ...categories] as Filter[]).map((c) => {
            const active = filter === c;
            const count =
              c === "All" ? projects.length : projects.filter((p) => p.category === c).length;
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                aria-pressed={active}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] uppercase tracking-[0.12em] transition-colors ${
                  active
                    ? "bg-forest text-white border-forest"
                    : "border-border text-foreground/70 hover:border-forest hover:text-forest"
                }`}
              >
                {c}
                <span
                  className={`text-[10px] font-mono ${active ? "text-gold" : "text-muted-foreground"}`}
                >
                  {String(count).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* GRID */}
      <section className="container-page pb-24">
        {filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">
            No projects in this category yet.
          </p>
        ) : (
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link
                key={p.slug}
                to="/projects/$slug"
                params={{ slug: p.slug }}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl bg-muted">
                  <img
                    src={p.image}
                    alt={p.name}
                    width={1280}
                    height={896}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-forest font-semibold">
                    {p.category}
                  </div>
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl leading-tight group-hover:text-forest transition-colors">
                      {p.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {p.location} · {p.year}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-gold whitespace-nowrap pt-1">
                    {p.value}
                  </span>
                </div>
              </Link>
            ))}

            {/* UPLOAD / ADD NEW SLOT */}
            <div className="rounded-2xl border-2 border-dashed border-border p-8 flex flex-col items-center justify-center text-center min-h-[320px] hover:border-forest hover:bg-forest-light/40 transition-colors group">
              <div className="h-14 w-14 rounded-full bg-gold-light flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-forest"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="font-display text-xl mt-5">Add a new project</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-[26ch]">
                Reserved space — drop in your latest completed build, with photos and a summary.
              </p>
              <Link
                to="/contact"
                className="mt-5 text-[11px] uppercase tracking-[0.18em] text-forest font-semibold group-hover:text-gold"
              >
                Request upload →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* STATS */}
      <section className="bg-limestone py-24">
        <div className="container-page grid gap-10 md:grid-cols-3">
          {[
            ["R 53M+", "Delivered in housing project value"],
            ["100%", "NHBRC compliance on housing"],
            [String(categories.length), "Sectors served across the portfolio"],
          ].map(([n, l]) => (
            <div key={l} className="border-t border-border pt-8">
              <div className="stat-num">{n}</div>
              <div className="mt-4 text-sm text-muted-foreground max-w-[22ch] leading-snug">
                {l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* REFERENCE */}
      <section className="container-page py-24">
        <div className="rounded-2xl border border-border p-10 md:p-14 relative overflow-hidden">
          <LogoWatermark className="absolute -right-10 -bottom-10 w-64" opacity={0.05} />
          <div className="relative">
            <div className="eyebrow">Client reference</div>
            <p className="font-display text-3xl md:text-4xl mt-5">Biston — Shirdo Trading</p>
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span>
                Tel:{" "}
                <a className="font-mono text-foreground" href="tel:+27836998687">
                  083 699 8687
                </a>
              </span>
              <span>
                Tel:{" "}
                <a className="font-mono text-foreground" href="tel:+27137457232">
                  013 745 7232
                </a>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-32">
        <div className="rounded-3xl bg-forest text-white p-12 md:p-16 flex flex-wrap items-center justify-between gap-6">
          <p className="font-display text-3xl md:text-4xl max-w-xl">
            Add your project to the portfolio.
          </p>
          <Link to="/contact" className="btn-gold">
            Start a project
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
