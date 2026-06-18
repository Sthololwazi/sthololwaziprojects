import rdp from "@/assets/project-rdp.jpg";
import school from "@/assets/project-school.jpg";
import hospital from "@/assets/project-hospital.jpg";
import civil from "@/assets/service-civil.jpg";
import craft from "@/assets/craft-bricks.jpg";

export type ProjectCategory = "Housing" | "Healthcare" | "Education" | "Civil" | "Commercial";

export interface Project {
  slug: string;
  name: string;
  category: ProjectCategory;
  year: string;
  location: string;
  value: string;
  client: string;
  summary: string;
  description: string[];
  scope: string[];
  image: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: "500-rdp-houses",
    name: "500 RDP Houses",
    category: "Housing",
    year: "2022",
    location: "Mpumalanga, South Africa",
    value: "R 53,000,000",
    client: "Department of Human Settlements",
    summary: "Project management of large-scale national housing delivery — 500 NHBRC-compliant homes from foundation to handover.",
    description: [
      "Sthololwazi Projects served as principal project manager on a 500-unit national housing delivery programme in Mpumalanga, coordinating procurement, construction, quality control and beneficiary handover across multiple sub-contractors.",
      "Every unit was built to NHBRC technical requirements with full document control, three-way invoice matching, and ward-level community engagement throughout the build cycle.",
      "The programme operated under our Each One, Teach One mandate — converting a measurable portion of project value into accredited on-the-job training for local artisans and labourers.",
    ],
    scope: [
      "Programme management of 500 housing units",
      "Procurement and material supply chain coordination",
      "Quality assurance to NHBRC standards",
      "Local labour onboarding and skills transfer",
      "Beneficiary handover documentation",
    ],
    image: rdp,
    featured: true,
  },
  {
    slug: "evander-hospital",
    name: "Evander Hospital",
    category: "Healthcare",
    year: "2021",
    location: "Evander, Mpumalanga",
    value: "R 70,000",
    client: "Provincial Department of Health",
    summary: "Renovation works at a working healthcare facility — completed without disruption to clinical operations.",
    description: [
      "Targeted renovation of selected wards and circulation areas at Evander Hospital, delivered to provincial Department of Health specifications.",
      "Construction was sequenced around live clinical operations, with strict infection-control protocols, dust containment and after-hours work where required.",
    ],
    scope: [
      "Ward refurbishment and finishes",
      "Plumbing and tiling to SANS 10252 / 10254",
      "Infection-control compliant phasing",
      "Snag-list close-out and handover",
    ],
    image: hospital,
  },
  {
    slug: "tholinhlanhla-primary-school",
    name: "Tholinhlanhla Primary School",
    category: "Education",
    year: "2020",
    location: "Mbombela, Mpumalanga",
    value: "R 97,000",
    client: "Department of Basic Education",
    summary: "Renovation of classroom blocks, ablutions and finishes — delivered with a full local labour cohort.",
    description: [
      "Renovation works across the Tholinhlanhla Primary School campus — classroom finishes, ablutions, painting and grounds — delivered to Department of Basic Education specifications.",
      "The build was used as a community-anchored skills transfer site, with ward-resident artisans assessed and registered on our Skills Transfer Register.",
    ],
    scope: [
      "Classroom refurbishment and painting",
      "Ablution facility upgrade",
      "Carpentry and joinery",
      "Skills transfer cohort hosted on-site",
    ],
    image: school,
  },
  {
    slug: "mpumalanga-road-works",
    name: "Regional Roads Maintenance",
    category: "Civil",
    year: "2023",
    location: "Mpumalanga, South Africa",
    value: "On request",
    client: "Local Municipality",
    summary: "Asphalt resurfacing, stormwater works and road markings on regional access routes.",
    description: [
      "Civil works package on regional access routes — including surface preparation, base correction, asphalt overlay, stormwater catchpit refurbishment and full road marking.",
      "Delivered to SANS 1200 standards with local subcontractor participation and on-site training in materials testing.",
    ],
    scope: [
      "Asphalt resurfacing",
      "Stormwater catchpit and channel works",
      "Road markings and signage",
      "Quality testing to SANS 1200",
    ],
    image: civil,
  },
  {
    slug: "commercial-brickwork-package",
    name: "Commercial Brickwork Package",
    category: "Commercial",
    year: "2023",
    location: "Mbombela, Mpumalanga",
    value: "On request",
    client: "Private Developer",
    summary: "Face-brick façade and partition walling for a mixed-use commercial structure.",
    description: [
      "Specialist brickwork package on a private commercial development — face-brick façade, internal load-bearing walling and partition walling delivered with master craftsmanship.",
      "Material supplied through our in-house division, giving the client tighter cost control and a single point of accountability from procurement to handover.",
    ],
    scope: [
      "Face-brick façade",
      "Internal load-bearing walling",
      "Partition walling",
      "Integrated material supply",
    ],
    image: craft,
  },
];

export const categories: ProjectCategory[] = ["Housing", "Healthcare", "Education", "Civil", "Commercial"];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
