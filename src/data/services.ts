export type ServiceSlug = "civil-construction" | "building-construction" | "material-supply";

export interface ServiceDetail {
  slug: ServiceSlug;
  number: string;
  title: string;
  tagline: string;
  intro: string;
  description: string[];
  capabilities: { title: string; description: string }[];
  standards: string[];
  cta: string;
  image: string; // import path
}

import civil from "@/assets/service-civil.jpg";
import supply from "@/assets/service-supply.jpg";
import craft from "@/assets/craft-bricks.jpg";

export const services: ServiceDetail[] = [
  {
    slug: "civil-construction",
    number: "01",
    title: "Civil Construction",
    tagline: "Municipal and roads infrastructure — built to engineering specification.",
    intro:
      "Earthworks, roads, water, sewer and stormwater delivered to SANS 1200 standards across Mpumalanga.",
    description: [
      "Our civil division delivers municipal and infrastructure works for provincial departments, local municipalities and private developers — from greenfield preparation through to commissioning.",
      "Every project is sequenced around testing milestones, ward-level engagement and a documented quality plan, so handover happens on time and on spec.",
    ],
    capabilities: [
      {
        title: "Roads & stormwater",
        description: "Surface preparation, layerworks, asphalt and concrete to SANS 1200.",
      },
      {
        title: "Water reticulation",
        description: "Bulk and reticulated water mains, valve chambers, pressure testing.",
      },
      {
        title: "Sewer & sanitation",
        description: "Gravity and rising sewers, manholes, pump stations and house connections.",
      },
      {
        title: "Bulk earthworks",
        description: "Cut to fill, layerworks, compaction testing and platform preparation.",
      },
    ],
    standards: ["SANS 1200", "CIDB 10127071", "ISO-aligned quality plan"],
    cta: "Request a civil works quote",
    image: civil,
  },
  {
    slug: "building-construction",
    number: "02",
    title: "Building Construction",
    tagline: "From RDP homes to commercial complexes — installed with master craftsmanship.",
    intro:
      "Full NHBRC-aligned residential, commercial and refurbishment construction — with seamless finishes and certified trades.",
    description: [
      "Our building division covers everything from RDP and social housing programmes to commercial structures, renovations and ongoing maintenance.",
      "Every brick, tile and pipe is installed to SANS standards, with certified plumbers, tilers, carpenters and welders working under a single site supervisor.",
    ],
    capabilities: [
      {
        title: "RDP & social housing",
        description: "Full NHBRC-aligned delivery, foundations through to handover.",
      },
      {
        title: "Commercial structures",
        description: "Retail, office and light industrial — SANS 10400 fire compliant.",
      },
      {
        title: "Renovations & maintenance",
        description: "Refurbishment and ongoing site upkeep with seamless finishes.",
      },
      { title: "Ceilings & drywall", description: "Fire-rated and acoustic systems to SANS 523." },
      {
        title: "Plumbing & tiling",
        description: "SANS 10252 / 10254 compliant plumbing and precision tiling.",
      },
      {
        title: "Carpentry, welding & fabrication",
        description: "Roof trusses, joinery, ARC / MIG / TIG metalwork.",
      },
    ],
    standards: ["NHBRC 3000190954", "SANS 10400", "SANS 10252 / 10254", "SANS 523"],
    cta: "Request a building works quote",
    image: craft,
  },
  {
    slug: "material-supply",
    number: "03",
    title: "Material Supply",
    tagline: "An in-house supply chain that tightens project budgets and de-risks delivery.",
    intro:
      "Volume supply of bricks, cement, aggregates, steel and consumables — delivered direct to site with quality-controlled batching.",
    description: [
      "Our material supply division gives clients a single point of accountability from procurement to handover — combining bulk pricing with on-site delivery scheduling.",
      "Every load is documented with batch certificates and weighbridge slips, so quality control is verifiable from yard to placement.",
    ],
    capabilities: [
      {
        title: "Bricks, blocks & cement",
        description: "Volume supply direct to site with quality-controlled batching.",
      },
      {
        title: "Aggregates & sand",
        description: "Crushed stone, river sand and base material in graded specs.",
      },
      {
        title: "Steel & reinforcement",
        description: "Rebar, mesh and structural steel to engineer schedules.",
      },
      {
        title: "Site consumables",
        description: "PPE, formwork, fasteners and finishing materials.",
      },
    ],
    standards: ["SANS-compliant batching", "Verified weighbridge slips", "CSD MAAA0446751"],
    cta: "Request a supply quote",
    image: supply,
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
