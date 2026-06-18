import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import civil from "@/assets/service-civil.jpg";
import supply from "@/assets/service-supply.jpg";
import craft from "@/assets/craft-bricks.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Sthololwazi Projects" },
      { name: "description", content: "Civil construction, building construction and material supply — three integrated divisions delivered to SANS standards across Mpumalanga." },
      { property: "og:title", content: "Services — Civil, Building & Material Supply" },
      { property: "og:description", content: "Three integrated divisions, one accountable partner." },
      { property: "og:image", content: civil },
    ],
  }),
  component: Services,
});

const divisions = [
  {
    img: civil,
    n: "01",
    title: "Civil Construction",
    intro: "Municipal and roads infrastructure delivered to stringent engineering specifications.",
    items: [
      ["Roads & stormwater", "Surface preparation, base layers, asphalt and concrete to SANS 1200."],
      ["Water reticulation", "Bulk and reticulated water mains, valve chambers, pressure testing."],
      ["Sewer & sanitation", "Gravity & rising sewers, manholes, pump stations and house connections."],
      ["Bulk earthworks", "Cut to fill, layerworks, compaction testing and platform preparation."],
    ],
  },
  {
    img: craft,
    n: "02",
    title: "Building Construction",
    intro: "From RDP homes to commercial complexes — installed to SANS standards with master craftsmanship.",
    items: [
      ["RDP & social housing", "Full NHBRC-aligned delivery, foundations through to handover."],
      ["Commercial structures", "Retail, office and light industrial — SANS 10400 fire compliant."],
      ["Renovations & maintenance", "Refurbishment and ongoing site upkeep with seamless finishes."],
      ["Ceilings & drywall partitioning", "Fire-rated and acoustic systems to SANS 523."],
      ["Plumbing & tiling", "SANS 10252 / 10254 compliant plumbing and precision tiling."],
      ["Carpentry, welding & fabrication", "Roof trusses, joinery, ARC / MIG / TIG metalwork."],
    ],
  },
  {
    img: supply,
    n: "03",
    title: "Material Supply Division",
    intro: "An in-house supply chain that mitigates delivery risk and tightens project budgets.",
    items: [
      ["Bricks, blocks & cement", "Volume supply direct to site with quality-controlled batching."],
      ["Aggregates & sand", "Crushed stone, river sand and base material in graded specs."],
      ["Steel & reinforcement", "Rebar, mesh and structural steel to engineer schedules."],
      ["Site consumables", "PPE, formwork, fasteners and finishing materials."],
    ],
  },
];

const valueAdds = [
  ["Dual-sector advantage", "Construction expertise plus integrated material supply — bulk savings, one accountable party from procurement to handover."],
  ["De-risked community engagement", "Ward-level hiring and councillor partnerships generate social goodwill and reduce site disruption."],
  ["B-BBEE empowerment multiplier", "Level 1, 135% procurement recognition — measurable score uplift for every client."],
  ["Regional technical judgement", "Built for Mpumalanga conditions, materials, climate and compliance regime."],
];

function Services() {
  return (
    <SiteLayout>
      <section className="pt-40 pb-20 container-page">
        <div className="eyebrow">Services</div>
        <h1 className="display-xl mt-6 max-w-4xl">
          Three integrated divisions. <span className="italic-accent">One</span> accountable partner.
        </h1>
        <p className="mt-10 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          A full-spectrum offering across civil construction, building construction and material
          supply — giving clients a single point of accountability, enhanced cost control, and a
          true partner in transformation.
        </p>
      </section>

      {divisions.map((d, i) => (
        <section key={d.n} className={i % 2 ? "bg-limestone" : ""}>
          <div className="container-page py-24 md:py-32">
            <div className={`grid gap-12 md:grid-cols-12 items-center ${i % 2 ? "md:[&>div:first-child]:order-2" : ""}`}>
              <div className="md:col-span-6">
                <img src={d.img} alt={d.title} width={1280} height={896} loading="lazy" className="rounded-2xl object-cover aspect-[4/3] w-full" />
              </div>
              <div className="md:col-span-5 md:col-start-8">
                <div className="font-mono text-xs text-gold">{d.n} · Division</div>
                <h2 className="display-lg mt-3">{d.title}</h2>
                <p className="mt-6 text-muted-foreground text-[15px] leading-relaxed">{d.intro}</p>
                <ul className="mt-10 divide-y divide-border border-y border-border">
                  {d.items.map(([t, dd]) => (
                    <li key={t} className="py-4 grid grid-cols-12 gap-4">
                      <div className="col-span-12 sm:col-span-5 font-medium text-foreground">{t}</div>
                      <div className="col-span-12 sm:col-span-7 text-sm text-muted-foreground">{dd}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* VALUE ADDS */}
      <section className="container-page py-28 md:py-36">
        <div className="eyebrow">The competitive edge</div>
        <h2 className="display-lg mt-5 max-w-3xl">Why clients choose Sthololwazi.</h2>
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {valueAdds.map(([t, d], i) => (
            <div key={t} className="border-t border-border pt-8">
              <div className="font-mono text-xs text-gold">0{i + 1}</div>
              <h3 className="font-display text-2xl mt-3">{t}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-32">
        <div className="rounded-3xl bg-onyx text-white p-12 md:p-16 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-lg">
            <div className="text-[11px] uppercase tracking-[0.22em] text-gold font-semibold">Project enquiry</div>
            <p className="font-display text-3xl md:text-4xl mt-4">Tell us what you're building. We'll respond within 48 hours.</p>
          </div>
          <Link to="/contact" className="btn-gold">Request a quote</Link>
        </div>
      </section>
    </SiteLayout>
  );
}
