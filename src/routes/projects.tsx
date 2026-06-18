import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import rdp from "@/assets/project-rdp.jpg";
import school from "@/assets/project-school.jpg";
import hospital from "@/assets/project-hospital.jpg";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Sthololwazi Projects" },
      { name: "description", content: "From the renovation of Tholinhlanhla Primary School to the management of 500 RDP houses — a track record across community infrastructure, healthcare and national housing." },
      { property: "og:title", content: "Projects — Track Record" },
      { property: "og:description", content: "Community infrastructure, healthcare facilities and national housing delivery." },
      { property: "og:image", content: rdp },
    ],
  }),
  component: Projects,
});

const projects = [
  {
    img: rdp,
    name: "500 RDP Houses",
    sector: "Housing · National delivery",
    value: "R 53,000,000",
    desc: "Project management of large-scale national housing delivery — 500 NHBRC-compliant homes, end-to-end coordination of procurement, construction, quality control and handover.",
  },
  {
    img: hospital,
    name: "Evander Hospital",
    sector: "Healthcare · Renovation",
    value: "R 70,000",
    desc: "Renovation works at a working healthcare facility — completed without disruption to clinical operations, to provincial Department of Health specifications.",
  },
  {
    img: school,
    name: "Tholinhlanhla Primary School",
    sector: "Education · Renovation",
    value: "R 97,000",
    desc: "Renovation works for a community primary school — classrooms, finishes and grounds delivered with local labour and a full skills-transfer cohort.",
  },
];

function Projects() {
  return (
    <SiteLayout>
      <section className="pt-40 pb-16 container-page">
        <div className="eyebrow">Projects</div>
        <h1 className="display-xl mt-6 max-w-4xl">
          A portfolio measured in <span className="italic-accent">homes built</span> and lives changed.
        </h1>
        <p className="mt-10 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Sthololwazi Projects has delivered across the full spectrum of civil works, building
          construction and large-scale project management — community infrastructure, healthcare
          facilities and national housing delivery.
        </p>
      </section>

      <section className="container-page space-y-24 md:space-y-32 py-16">
        {projects.map((p, i) => (
          <article key={p.name} className="grid gap-10 md:grid-cols-12 items-center">
            <div className={`md:col-span-7 ${i % 2 ? "md:order-2" : ""}`}>
              <div className="overflow-hidden rounded-2xl">
                <img src={p.img} alt={p.name} width={1280} height={896} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              </div>
            </div>
            <div className={`md:col-span-5 ${i % 2 ? "md:order-1 md:col-start-1" : ""}`}>
              <div className="font-mono text-xs text-gold">{p.sector}</div>
              <h2 className="display-md mt-4">{p.name}</h2>
              <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-border px-4 py-2 text-sm">
                <span className="text-muted-foreground">Project value</span>
                <span className="font-mono">{p.value}</span>
              </div>
              <p className="mt-6 text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="bg-limestone py-28">
        <div className="container-page grid gap-10 md:grid-cols-3">
          {[
            ["R 53M+", "Delivered in housing project value"],
            ["100%", "NHBRC compliance on housing"],
            ["3", "Sectors served — housing, health, education"],
          ].map(([n, l]) => (
            <div key={l} className="border-t border-border pt-8">
              <div className="stat-num">{n}</div>
              <div className="mt-4 text-sm text-muted-foreground max-w-[18ch] leading-snug">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-28">
        <div className="rounded-2xl border border-border p-10 md:p-14">
          <div className="eyebrow">Client reference</div>
          <p className="font-display text-3xl md:text-4xl mt-5 max-w-3xl leading-tight">
            Biston — Shirdo Trading
          </p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span>Tel: <a className="font-mono text-foreground" href="tel:+27836998687">083 699 8687</a></span>
            <span>Tel: <a className="font-mono text-foreground" href="tel:+27137457232">013 745 7232</a></span>
          </div>
        </div>
      </section>

      <section className="container-page pb-32">
        <div className="rounded-3xl bg-forest text-white p-12 md:p-16 flex flex-wrap items-center justify-between gap-6">
          <p className="font-display text-3xl md:text-4xl max-w-xl">
            Add your project to the portfolio.
          </p>
          <Link to="/contact" className="btn-gold">Start a project</Link>
        </div>
      </section>
    </SiteLayout>
  );
}
