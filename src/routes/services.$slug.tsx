import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { getService, services, type ServiceDetail } from "@/data/services";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = getService(params.slug);
    if (!service) throw notFound();
    return service;
  },
  head: ({ params, loaderData }) => {
    const s = loaderData;
    const title = s ? `${s.title} — Sthololwazi Projects` : "Service — Sthololwazi Projects";
    const desc = s?.intro ?? "Construction service by Sthololwazi Projects.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/services/${params.slug}` },
        ...(s ? [{ property: "og:image", content: s.image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        ...(s ? [{ name: "twitter:image", content: s.image }] : []),
      ],
      links: [{ rel: "canonical", href: `/services/${params.slug}` }],
      scripts: s
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Service",
                name: s.title,
                description: s.intro,
                serviceType: s.title,
                provider: { "@type": "Organization", name: "Sthololwazi Projects (Pty) Ltd" },
                areaServed: { "@type": "AdministrativeArea", name: "Mpumalanga, South Africa" },
                url: `/services/${params.slug}`,
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
        <h1 className="display-lg mt-4">Service not found</h1>
        <Link to="/services" className="btn-primary mt-10 inline-flex">
          ← All services
        </Link>
      </div>
    </SiteLayout>
  ),
  component: ServiceDetailPage,
});

function ServiceDetailPage() {
  const s = Route.useLoaderData() as ServiceDetail;
  const others = services.filter((x) => x.slug !== s.slug);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative pt-32 pb-16">
        <div className="container-page">
          <Link
            to="/services"
            className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-forest"
          >
            ← All services
          </Link>
          <div className="mt-8 grid gap-12 lg:grid-cols-12 items-end">
            <div className="lg:col-span-7">
              <div className="font-mono text-xs text-gold tracking-widest">
                {s.number} · DIVISION
              </div>
              <h1 className="display-xl mt-4">{s.title}</h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                {s.tagline}
              </p>
            </div>
            <div className="lg:col-span-5">
              <img
                src={s.image}
                alt={s.title}
                width={1280}
                height={896}
                className="rounded-2xl object-cover aspect-[4/3] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="container-page py-24 md:py-32">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-7 space-y-6 text-[16px] leading-[1.8] text-muted-foreground">
            <div className="eyebrow !text-foreground">Overview</div>
            {s.description.map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            <div className="eyebrow !text-foreground pt-8">Capabilities</div>
            <ul className="divide-y divide-border border-y border-border not-prose">
              {s.capabilities.map((c) => (
                <li key={c.title} className="py-4 grid grid-cols-12 gap-4">
                  <div className="col-span-12 sm:col-span-5 font-medium text-foreground">
                    {c.title}
                  </div>
                  <div className="col-span-12 sm:col-span-7 text-sm">{c.description}</div>
                </li>
              ))}
            </ul>
          </div>

          <aside className="md:col-span-4 md:col-start-9 space-y-6">
            <div className="rounded-2xl bg-forest text-white p-8">
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold font-semibold">
                Standards
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                {s.standards.map((st) => (
                  <li key={st} className="flex gap-2">
                    <span className="text-gold">→</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>
            <QuickContact serviceTitle={s.title} />
          </aside>
        </div>
      </section>

      {/* CONSISTENT CTA STRIP */}
      <section className="container-page pb-16">
        <div className="rounded-3xl bg-onyx text-white p-10 md:p-14 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-lg">
            <div className="text-[11px] uppercase tracking-[0.22em] text-gold font-semibold">
              {s.cta}
            </div>
            <p className="font-display text-3xl md:text-4xl mt-4">
              Get a 48-hour response from our team in Mbombela.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="btn-gold">
              Request a quote
            </Link>
            <a
              href="tel:+27646204247"
              className="btn-ghost text-white border-white/30 hover:!text-white hover:!border-white hover:bg-white/10"
            >
              Call 064 620 4247
            </a>
          </div>
        </div>
      </section>

      {/* OTHER SERVICES */}
      <section className="bg-limestone py-24">
        <div className="container-page">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <h2 className="display-md">Other divisions</h2>
            <Link to="/services" className="btn-ghost">
              All services →
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {others.map((o) => (
              <Link
                key={o.slug}
                to="/services/$slug"
                params={{ slug: o.slug }}
                className="group rounded-2xl border border-border bg-background p-8 hover:border-forest transition-colors"
              >
                <div className="font-mono text-xs text-gold">{o.number} · DIVISION</div>
                <h3 className="font-display text-2xl mt-3 group-hover:text-forest transition-colors">
                  {o.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-3">{o.tagline}</p>
                <div className="mt-6 text-sm font-medium text-forest">Learn more →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function QuickContact({ serviceTitle }: { serviceTitle: string }) {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const subject = encodeURIComponent(`${serviceTitle} enquiry — ${fd.get("name")}`);
    const body = encodeURIComponent(
      `Service: ${serviceTitle}\nName: ${fd.get("name")}\nPhone: ${fd.get("phone")}\nEmail: ${fd.get("email")}\n\n${fd.get("message")}`,
    );
    window.location.href = `mailto:projectssthololwazi@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  };
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-3">
      <div className="text-[11px] uppercase tracking-[0.22em] text-forest font-semibold">
        Quick enquiry
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        Get a fast scope-specific reply on {serviceTitle.toLowerCase()}.
      </p>
      <input
        name="name"
        required
        placeholder="Your name"
        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
      />
      <input
        name="phone"
        type="tel"
        placeholder="Phone (optional)"
        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
      />
      <textarea
        name="message"
        required
        rows={3}
        placeholder={`Scope, location, timeline…`}
        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest resize-none"
      />
      <button type="submit" className="btn-primary w-full justify-center">
        {sent ? "Sent ✓" : "Send enquiry"}
      </button>
      <p className="text-[11px] text-muted-foreground text-center">
        Opens your email client pre-filled.
      </p>
    </form>
  );
}
