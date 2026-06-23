import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { SITE_URL } from "@/lib/site";
import logo from "@/assets/logo.png.asset.json";
import hero from "@/assets/hero-construction.jpg";
import craft from "@/assets/craft-bricks.jpg";
import foreman from "@/assets/team-foreman.jpg";
import rdp from "@/assets/project-rdp.jpg";
import school from "@/assets/project-school.jpg";
import hospital from "@/assets/project-hospital.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sthololwazi Projects — Civil & Building Construction · Mpumalanga" },
      {
        name: "description",
        content:
          "Sthololwazi Projects is a 100% black-owned, B-BBEE Level 1 civil and building construction company in Mbombela. Building infrastructure. Empowering communities.",
      },
      { property: "og:title", content: "Sthololwazi Projects — Civil & Building Construction" },
      {
        property: "og:description",
        content: "Building infrastructure. Empowering communities. Mending the future.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: `${SITE_URL}${hero}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Sthololwazi Projects — Civil & Building Construction" },
      {
        name: "twitter:description",
        content: "100% black-owned, B-BBEE Level 1 contractor in Mpumalanga.",
      },
      { name: "twitter:image", content: `${SITE_URL}${hero}` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Sthololwazi Projects",
          url: `${SITE_URL}/`,
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-end overflow-hidden">
        <img
          src={hero}
          alt="Sthololwazi Projects construction site in Mpumalanga at golden hour"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx/90 via-onyx/40 to-onyx/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-onyx/60 via-transparent to-transparent" />

        <div className="relative container-page pb-20 pt-40 w-full">
          <div className="max-w-3xl text-white">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-gold">
              <span className="rule-gold" />
              Est. 2017 · Mbombela, Mpumalanga
            </div>
            <h1 className="display-xl mt-6 text-white">
              Building infrastructure.
              <br />
              <span className="italic-accent">Empowering</span> communities.
            </h1>
            <p className="mt-8 max-w-xl text-base md:text-lg text-white/75 leading-relaxed">
              A 100% black-owned, B-BBEE Level 1 civil and building construction partner — pairing
              technical mastery with a measurable mandate to upskill the workforces of the
              communities we build in.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/contact" className="btn-gold">
                Start a project
              </Link>
              <Link
                to="/services"
                className="btn-ghost text-white border-white/30 hover:bg-white/10 hover:!text-white hover:!border-white"
              >
                Our services
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl">
              {[
                ["2017", "Established"],
                ["Level 1", "B-BBEE"],
                ["100%", "Black-Owned"],
                ["3", "Divisions"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-3xl md:text-4xl font-light text-white">{n}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="container-page py-28 md:py-40">
        <div className="grid gap-16 md:grid-cols-12 items-start">
          <div className="md:col-span-5">
            <div className="eyebrow">Our philosophy</div>
            <h2 className="display-lg mt-6">
              Not a contractor. An <span className="italic-accent">infrastructure & social</span>{" "}
              development partner.
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7 space-y-6 text-[15px] leading-[1.75] text-muted-foreground">
            <p>
              Founded in 2017 in response to a regional need for technically excellent construction
              that simultaneously advances Broad-based Black Economic Empowerment, Sthololwazi
              Projects operates on a dual mandate.
            </p>
            <p>
              We deliver high-quality civil and building works — and we ensure that every project
              leaves behind a lasting legacy of skills, local employment, and economic dignity for
              previously disadvantaged communities.
            </p>
            <p className="font-display text-2xl text-foreground italic font-light leading-snug pt-2">
              “Building infrastructure. Empowering communities. Mending the future — one brick, one
              skill, one life at a time.”
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES — HEADLINE SECTION */}
      <section id="services" className="relative bg-onyx text-white py-28 md:py-40 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #C99A3B 0 1px, transparent 1px 22px)",
          }}
        />
        <div className="container-page relative">
          <div className="grid gap-12 md:grid-cols-12 items-end mb-20">
            <div className="md:col-span-8">
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold font-semibold flex items-center gap-3">
                <span className="rule-gold" /> What we do best
              </div>
              <h2 className="display-xl mt-6 text-white">
                Services <span className="italic-accent">engineered</span> for impact.
              </h2>
              <p className="mt-8 text-white/70 text-lg max-w-2xl leading-relaxed">
                Three integrated divisions delivering technical excellence and measurable
                empowerment on every project — from bulk earthworks to handover.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Link to="/services" className="btn-gold">
                Explore all services →
              </Link>
            </div>
          </div>

          <div className="grid gap-px bg-white/10 md:grid-cols-3 rounded-2xl overflow-hidden">
            {[
              {
                n: "01",
                t: "Civil Construction",
                d: "Roads, stormwater, water reticulation, sewer & sanitation, and bulk earthworks — to SANS 1200 standards.",
                items: ["Roads & asphalt", "Water reticulation", "Bulk earthworks", "Stormwater"],
                href: "/services" as const,
              },
              {
                n: "02",
                t: "Building Construction",
                d: "RDP & social housing, commercial structures, renovations, ceilings, plumbing, carpentry and welding.",
                items: ["RDP housing", "Commercial builds", "Renovations", "Plumbing & tiling"],
                href: "/services" as const,
              },
              {
                n: "03",
                t: "Material Supply",
                d: "In-house supply division delivering bricks, cement, aggregates and steel direct to site at scale.",
                items: ["Bricks & cement", "Aggregates", "Steel & rebar", "Site consumables"],
                href: "/services" as const,
              },
            ].map((s) => (
              <div
                key={s.n}
                className="bg-onyx p-10 md:p-12 group hover:bg-forest transition-colors duration-500 flex flex-col"
              >
                <div className="flex items-baseline justify-between">
                  <div className="font-mono text-xs text-gold tracking-widest">
                    {s.n} · DIVISION
                  </div>
                  <div className="font-display text-5xl font-light text-white/15 group-hover:text-gold/40 transition-colors">
                    {s.n}
                  </div>
                </div>
                <h3 className="font-display text-3xl mt-6 text-white">{s.t}</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/65">{s.d}</p>
                <ul className="mt-6 space-y-2 text-sm text-white/80">
                  {s.items.map((it) => (
                    <li key={it} className="flex items-center gap-2">
                      <span className="h-1 w-3 bg-gold" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={s.href}
                  className="mt-auto pt-8 inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-white transition-colors"
                >
                  Learn more <span aria-hidden>→</span>
                </Link>
              </div>
            ))}
          </div>

          {/* Inline CTA strip under services */}
          <div className="mt-14 rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8 flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="font-display text-2xl md:text-3xl text-white">
                Need a quote on a specific scope?
              </div>
              <div className="text-sm text-white/60 mt-2">
                Tender response · Private development · Material supply · 48-hour reply.
              </div>
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
        </div>
      </section>

      {/* IMAGE + COMMITMENT */}
      <section className="container-page py-28 md:py-40">
        <div className="grid gap-12 md:grid-cols-12 items-center">
          <div className="md:col-span-6">
            <img
              src={craft}
              alt="Skilled artisan laying brickwork on a Sthololwazi Projects site"
              width={1280}
              height={1280}
              loading="lazy"
              className="rounded-2xl object-cover aspect-[4/5] w-full"
            />
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <div className="eyebrow">The empowerment multiplier</div>
            <h2 className="display-lg mt-6">A verifiable B-BBEE contribution on every project.</h2>
            <p className="mt-8 text-[15px] leading-[1.75] text-muted-foreground">
              For every site we open, our first operational directive is to identify, onboard and
              upskill local workers in partnership with ward councillors and community structures. A
              measurable portion of project value is converted into accredited, on-the-job training.
            </p>

            <ul className="mt-10 divide-y divide-border border-y border-border">
              {[
                [
                  "Each One, Teach One",
                  "Mentorship programme pairing artisans with local mentees.",
                ],
                ["Ward-level engagement", "Transparent hiring with the communities we build in."],
                [
                  "Skills Transfer Register",
                  "Live B-BBEE evidence captured per project, per skill.",
                ],
              ].map(([t, d]) => (
                <li key={t} className="py-5 flex gap-6">
                  <span className="font-mono text-xs text-gold pt-1">→</span>
                  <div>
                    <div className="font-medium text-foreground">{t}</div>
                    <div className="text-sm text-muted-foreground mt-1">{d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="bg-onyx text-white py-28 md:py-36">
        <div className="container-page">
          <div className="flex items-end justify-between gap-8 flex-wrap mb-16">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold font-semibold">
                Track record
              </div>
              <h2 className="display-lg mt-5 text-white max-w-2xl">
                From a single classroom block to 500 homes delivered.
              </h2>
            </div>
            <Link
              to="/projects"
              className="btn-ghost text-white border-white/25 hover:!text-white hover:!border-white hover:bg-white/10"
            >
              View all projects →
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                img: rdp,
                t: "500 RDP Houses",
                d: "National housing delivery, project management",
                v: "R 53,000,000",
              },
              { img: hospital, t: "Evander Hospital", d: "Renovation works", v: "R 70,000" },
              {
                img: school,
                t: "Tholinhlanhla Primary School",
                d: "Renovation works",
                v: "R 97,000",
              },
            ].map((p) => (
              <article key={p.t} className="group">
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={p.img}
                    alt={p.t}
                    width={1280}
                    height={896}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="mt-5">
                  <div className="font-mono text-xs text-gold">{p.v}</div>
                  <h3 className="font-display text-2xl mt-2 text-white">{p.t}</h3>
                  <p className="text-sm text-white/60 mt-1">{p.d}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PEOPLE */}
      <section className="container-page py-28 md:py-40">
        <div className="grid gap-12 md:grid-cols-12 items-center">
          <div className="md:col-span-5">
            <div className="eyebrow">Our people</div>
            <h2 className="display-lg mt-6">
              Master craft. <span className="italic-accent">Local knowledge.</span>
            </h2>
            <p className="mt-8 text-[15px] leading-[1.75] text-muted-foreground">
              From RDP homes to commercial complexes, every brick, tile and pipe is installed to
              SANS standards. We are accountable to the communities we build in, and we hire locally
              on every site.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/about" className="btn-primary">
                About us
              </Link>
              <Link to="/contact" className="btn-ghost">
                Work with us
              </Link>
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7 grid grid-cols-2 gap-4">
            <img
              src={foreman}
              alt="Site foreman"
              width={1024}
              height={1280}
              loading="lazy"
              className="rounded-xl object-cover aspect-[3/4] w-full"
            />
            <div className="space-y-4">
              <div className="rounded-xl bg-forest text-white p-6">
                <div className="font-display text-5xl font-light leading-none">
                  135<span className="text-2xl align-top">%</span>
                </div>
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-white/70">
                  Procurement recognition
                </div>
              </div>
              <div className="rounded-xl bg-gold-light p-6">
                <div className="font-display text-5xl font-light leading-none text-onyx">Zero</div>
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-onyx/70">
                  Harm site policy
                </div>
              </div>
              <div className="rounded-xl border border-border p-6">
                <div className="font-mono text-xs text-gold">CIDB 10127071</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Construction Industry Development Board registered.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-32">
        <div className="rounded-3xl bg-forest text-white p-12 md:p-20 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full border-[40px] border-gold/15" />
          <div className="absolute -bottom-24 left-20 h-56 w-56 rounded-full border-[30px] border-gold/10" />
          <div className="relative max-w-2xl">
            <img src={logo.url} alt="" width={64} height={64} className="h-16 w-16" />
            <h2 className="display-lg mt-8 text-white">Let's build something that lasts.</h2>
            <p className="mt-6 text-white/75 text-lg max-w-xl">
              Whether it's a tender response, a private development, or a community project — start
              a conversation with the team in Mbombela.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/contact" className="btn-gold">
                Request a quote
              </Link>
              <a
                href="tel:+27646204247"
                className="btn-ghost text-white border-white/30 hover:!text-white hover:!border-white hover:bg-white/10"
              >
                064 620 4247
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
