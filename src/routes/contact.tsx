import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Sthololwazi Projects · Mbombela, Mpumalanga" },
      {
        name: "description",
        content:
          "Get in touch with Sthololwazi Projects in Mbombela, Mpumalanga. Request a quote, submit a tender enquiry, or schedule a site visit.",
      },
      { property: "og:title", content: "Contact — Sthololwazi Projects" },
      {
        property: "og:description",
        content: "Mbombela, Mpumalanga · 064 620 4247 · projectssthololwazi@gmail.com",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Contact — Sthololwazi Projects" },
      { name: "twitter:description", content: "Mbombela, Mpumalanga · 064 620 4247" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Sthololwazi Projects",
          url: "/contact",
        }),
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const subject = encodeURIComponent(`Enquiry from ${fd.get("name")}`);
    const body = encodeURIComponent(
      `Name: ${fd.get("name")}\nCompany: ${fd.get("company")}\nPhone: ${fd.get("phone")}\nEmail: ${fd.get("email")}\nProject type: ${fd.get("type")}\n\n${fd.get("message")}`,
    );
    window.location.href = `mailto:projectssthololwazi@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <SiteLayout>
      <section className="pt-40 pb-16 container-page">
        <div className="eyebrow">Contact</div>
        <h1 className="display-xl mt-6 max-w-4xl">
          Let's <span className="italic-accent">build</span> something together.
        </h1>
        <p className="mt-10 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Tell us about your project — public works, private development, tender response or
          material supply request. We respond within 48 hours.
        </p>
      </section>

      <section className="container-page pb-32">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5 space-y-10">
            <div>
              <div className="eyebrow">Office</div>
              <p className="mt-4 text-foreground leading-relaxed">
                K01041 Hilaria, Msogwaba
                <br />
                Mbombela 1215
                <br />
                Mpumalanga, South Africa
              </p>
            </div>
            <div>
              <div className="eyebrow">Phone</div>
              <a
                href="tel:+27646204247"
                className="block font-display text-3xl mt-4 hover:text-forest transition-colors"
              >
                064 620 4247
              </a>
            </div>
            <div>
              <div className="eyebrow">Email</div>
              <a
                href="mailto:projectssthololwazi@gmail.com"
                className="block font-display text-2xl mt-4 break-all hover:text-forest transition-colors"
              >
                projectssthololwazi@gmail.com
              </a>
            </div>
            <div className="rounded-2xl bg-limestone p-6">
              <div className="text-[11px] uppercase tracking-[0.18em] text-forest font-semibold">
                Tender administration
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                For bid submissions, please include the tender reference, closing date, and any
                mandatory returnable schedules in your message. We will confirm receipt within one
                business day.
              </p>
            </div>
          </div>

          <div className="md:col-span-7">
            <form
              onSubmit={onSubmit}
              className="rounded-2xl border border-border p-8 md:p-10 bg-card space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field name="name" label="Name" required />
                <Field name="company" label="Company / Department" />
                <Field name="email" label="Email" type="email" required />
                <Field name="phone" label="Phone" type="tel" />
              </div>
              <div>
                <label
                  className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2"
                  htmlFor="type"
                >
                  Project type
                </label>
                <select
                  id="type"
                  name="type"
                  className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option>Civil construction</option>
                  <option>Building construction</option>
                  <option>Material supply</option>
                  <option>Tender response</option>
                  <option>General enquiry</option>
                </select>
              </div>
              <div>
                <label
                  className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2"
                  htmlFor="message"
                >
                  Project description
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  placeholder="Scope, location, timeline, budget range…"
                  className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                />
              </div>
              <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                <p className="text-xs text-muted-foreground max-w-xs">
                  Submitting opens your email client with the enquiry pre-filled.
                </p>
                <button type="submit" className="btn-primary">
                  {sent ? "Sent ✓" : "Send enquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2"
      >
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
      />
    </div>
  );
}
