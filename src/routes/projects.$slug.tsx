import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { LogoWatermark } from "@/components/site/LogoWatermark";
import { getProject, projects, type Project } from "@/data/projects";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ params }) => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.project;
    const title = p ? `${p.name} — Sthololwazi Projects` : "Project — Sthololwazi Projects";
    const desc = p?.summary ?? "Project case study by Sthololwazi Projects.";
    const canonical = `${SITE_URL}/projects/${params.slug}`;
    // Absolute, with .svg extension so static crawlers (Twitter, WhatsApp,
    // Slack) fetch a real image asset, not an HTML route.
    const ogImage = `${SITE_URL}/api/og/projects/${params.slug}.svg`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:type", content: "image/svg+xml" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: ogImage },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: p
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "CreativeWork",
                name: p.name,
                description: p.summary,
                dateCreated: p.year,
                image: ogImage,
                locationCreated: { "@type": "Place", name: p.location },
                creator: { "@type": "Organization", name: "Sthololwazi Projects (Pty) Ltd" },
                url: `/projects/${params.slug}`,
              }),
            },
          ]
        : [],
    };
  },

  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-page py-40 text-center">
        <div className="eyebrow">404</div>
        <h1 className="display-lg mt-4">Project not found</h1>
        <p className="mt-6 text-muted-foreground">The project you're looking for doesn't exist or has moved.</p>
        <Link to="/projects" className="btn-primary mt-10 inline-flex">← Back to projects</Link>
      </div>
    </SiteLayout>
  ),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { project: p } = Route.useLoaderData() as { project: Project; origin: string };
  const related = projects.filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative pt-32 pb-16">
        <div className="container-page">
          <Link to="/projects" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-forest">
            ← All projects
          </Link>
          <div className="mt-8 grid gap-12 lg:grid-cols-12 items-end">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-gold font-semibold">
                <span className="rule-gold" />
                {p.category}
              </div>
              <h1 className="display-xl mt-6">{p.name}</h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">{p.summary}</p>
            </div>
            <dl className="lg:col-span-5 grid grid-cols-2 gap-x-8 gap-y-6">
              <Spec label="Year" value={p.year} />
              <Spec label="Location" value={p.location} />
              <Spec label="Client" value={p.client} />
              <Spec label="Value" value={p.value} mono />
            </dl>
          </div>
        </div>
      </section>

      {/* IMAGE */}
      <section className="container-page">
        <div className="overflow-hidden rounded-3xl">
          <img
            src={p.image}
            alt={p.name}
            width={1920}
            height={1280}
            className="w-full aspect-[16/9] object-cover"
          />
        </div>
      </section>

      {/* BODY */}
      <section className="container-page py-24 md:py-32">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-7 space-y-6 text-[16px] leading-[1.8] text-muted-foreground">
            <div className="eyebrow !text-foreground">Project narrative</div>
            {p.description.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <div className="rounded-2xl bg-forest-light p-8 relative overflow-hidden">
              <LogoWatermark className="absolute -right-6 -bottom-6 w-40" opacity={0.07} />
              <div className="relative">
                <div className="eyebrow">Scope of work</div>
                <ul className="mt-6 space-y-3">
                  {p.scope.map((s) => (
                    <li key={s} className="flex gap-3 text-sm text-foreground">
                      <span className="text-gold font-mono">→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section className="bg-limestone py-24">
        <div className="container-page">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <h2 className="display-md">More projects</h2>
            <Link to="/projects" className="btn-ghost">View all →</Link>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} to="/projects/$slug" params={{ slug: r.slug }} className="group">
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={r.image}
                    alt={r.name}
                    width={1280}
                    height={896}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">{r.category}</div>
                  <h3 className="font-display text-xl mt-2 group-hover:text-forest transition-colors">{r.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-24">
        <div className="rounded-3xl bg-onyx text-white p-12 md:p-16 flex flex-wrap items-center justify-between gap-6">
          <p className="font-display text-3xl md:text-4xl max-w-xl">Have a similar project in mind?</p>
          <Link to="/contact" className="btn-gold">Request a quote</Link>
        </div>
      </section>
    </SiteLayout>
  );
}

function Spec({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className={`mt-2 text-foreground ${mono ? "font-mono text-base" : "font-display text-lg"}`}>{value}</dd>
    </div>
  );
}
