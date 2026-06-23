import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { SITE_URL } from "@/lib/site";
import foreman from "@/assets/team-foreman.jpg";
import craft from "@/assets/craft-bricks.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Sthololwazi Projects" },
      {
        name: "description",
        content:
          "100% black-owned, B-BBEE Level 1 civil and building contractor founded in 2017 in Mbombela, Mpumalanga.",
      },
      { property: "og:title", content: "About — Sthololwazi Projects" },
      {
        property: "og:description",
        content: "An infrastructure and social development partner, not just a contractor.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/about` },
      { property: "og:image", content: `${SITE_URL}${foreman}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "About — Sthololwazi Projects" },
      { name: "twitter:description", content: "An infrastructure and social development partner." },
      { name: "twitter:image", content: `${SITE_URL}${foreman}` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About — Sthololwazi Projects",
          url: `${SITE_URL}/about`,
        }),
      },
    ],
  }),
  component: About,
});

const values = [
  [
    "Empowerment",
    "Success measured not just by structures, but by workers upskilled and local enterprises sustained.",
  ],
  ["Integrity", "Honesty, transparency, and strict adherence to ethical construction practices."],
  [
    "Community first",
    "The local community is our primary stakeholder — their employment, their safety, their long-term benefit.",
  ],
  [
    "Quality without compromise",
    "From an RDP home to a commercial complex — every brick to SANS standards.",
  ],
  ["Safety", "Zero-harm site environments through rigorous protocols and continuous training."],
  [
    "Innovation & efficiency",
    "Innovative solutions and efficient internal processes for every client we serve.",
  ],
];

const registrations = [
  ["Company Reg.", "2017/135433/07"],
  ["NHBRC", "3000190954"],
  ["CIDB", "10127071"],
  ["Tax Number", "9071664248"],
  ["CSD Supply No.", "MAAA0446751"],
  ["B-BBEE Level", "Level 1 · 135%"],
];

function About() {
  return (
    <SiteLayout>
      <section className="pt-40 pb-20 container-page">
        <div className="eyebrow">About</div>
        <h1 className="display-xl mt-6 max-w-4xl">
          A deliberate engine for <span className="italic-accent">economic inclusion</span> —
          operating from the heart of Mpumalanga.
        </h1>
        <p className="mt-10 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Sthololwazi Projects is a proudly South African, 100% black-owned construction and
          material supply company based in Mbombela. Founded in 2017, established as a direct
          response to the need for technically excellent construction services that simultaneously
          advance the principles of Broad-based Black Economic Empowerment.
        </p>
      </section>

      <section className="container-page grid gap-8 md:grid-cols-2">
        <img
          src={craft}
          alt="Brickwork detail"
          width={1280}
          height={1280}
          loading="lazy"
          className="rounded-2xl object-cover aspect-[4/3] w-full"
        />
        <img
          src={foreman}
          alt="Site foreman"
          width={1024}
          height={1280}
          loading="lazy"
          className="rounded-2xl object-cover aspect-[4/3] w-full"
        />
      </section>

      {/* Vision / Mission */}
      <section className="container-page py-28 md:py-36">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="eyebrow">Vision</div>
            <p className="font-display text-2xl mt-5 leading-snug">
              To be Mpumalanga's most trusted construction partner — measured equally by quality
              delivered and lives transformed.
            </p>
          </div>
          <div>
            <div className="eyebrow">Mission</div>
            <p className="font-display text-2xl mt-5 leading-snug">
              Deliver civil and building works of national standard, while converting every site
              into a school of skills for the surrounding community.
            </p>
          </div>
          <div>
            <div className="eyebrow">Promise</div>
            <p className="font-display text-2xl mt-5 leading-snug italic-accent">
              Building infrastructure. Empowering communities. Mending the future.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-limestone py-28">
        <div className="container-page">
          <div className="eyebrow">Core values</div>
          <h2 className="display-lg mt-5 max-w-2xl">
            The principles that hold up every site we open.
          </h2>
          <div className="mt-16 grid gap-px bg-border md:grid-cols-3 rounded-2xl overflow-hidden">
            {values.map(([t, d], i) => (
              <div key={t} className="bg-background p-8 md:p-10">
                <div className="font-mono text-xs text-gold">0{i + 1}</div>
                <h3 className="font-display text-2xl mt-4">{t}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registrations */}
      <section className="container-page py-28 md:py-36">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="eyebrow">Compliance</div>
            <h2 className="display-lg mt-5">Registrations & accreditations.</h2>
            <p className="mt-6 text-muted-foreground">
              Fully accredited, audit-ready and tender-eligible across South Africa's public and
              private sectors.
            </p>
          </div>
          <div className="md:col-span-8 grid gap-px bg-border md:grid-cols-3 rounded-xl overflow-hidden">
            {registrations.map(([k, v]) => (
              <div key={k} className="bg-background p-6">
                <div className="text-[11px] uppercase tracking-[0.18em] text-forest font-semibold">
                  {k}
                </div>
                <div className="font-mono text-base mt-2">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page pb-32">
        <div className="rounded-2xl border border-border p-10 md:p-14 flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="eyebrow">Ready to talk?</div>
            <p className="font-display text-3xl mt-3">Let's scope your next project together.</p>
          </div>
          <Link to="/contact" className="btn-primary">
            Get in touch
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
