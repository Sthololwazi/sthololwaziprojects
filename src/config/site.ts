/**
 * Central site configuration
 * Single source of truth for all site-wide constants
 */

export const SITE = {
  name: "Sthololwazi Projects",
  fullName: "Sthololwazi Projects (Pty) Ltd",
  description:
    "100% black-owned, B-BBEE Level 1 civil and building construction company in Mbombela, Mpumalanga. Building infrastructure. Empowering communities.",
  shortDescription:
    "100% black-owned, B-BBEE Level 1 civil and building contractor based in Mbombela, Mpumalanga.",
  tagline: "Building infrastructure. Empowering communities. Mending the future.",
  url: "https://sthololwaziprojects.lovable.app",
  canonicalHost: "sthololwaziprojects.lovable.app",

  contact: {
    email: "projectssthololwazi@gmail.com",
    phone: "+27646204247",
    phoneDisplay: "064 620 4247",
    address: {
      street: "K01041 Hilaria, Msogwaba",
      city: "Mbombela",
      postal: "1215",
      province: "Mpumalanga",
      country: "South Africa",
      countryCode: "ZA",
    },
  },

  registration: {
    company: "2017/135433/07",
    nhbrc: "3000190954",
    cidb: "10127071",
    tax: "9071664248",
    csd: "MAAA0446751",
    bbeeLevel: "Level 1",
    bbeePercentage: "135%",
    established: 2017,
  },

  social: {
    og: {
      themeColor: "#1A5C2A",
      image:
        "https://storage.googleapis.com/gpt-engineer-file-uploads/aPjJ3FQth5OWxFvYLVct2x9189R2/social-images/social-1781777585943-logo.webp",
    },
  },

  schemas: {
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Sthololwazi Projects (Pty) Ltd",
      alternateName: "Sthololwazi Projects",
      description:
        "100% black-owned, B-BBEE Level 1 civil and building construction company in Mbombela, Mpumalanga.",
      foundingDate: "2017",
      url: "https://sthololwaziprojects.lovable.app",
      areaServed: { "@type": "AdministrativeArea", name: "South Africa" },
      identifier: [
        { "@type": "PropertyValue", propertyID: "CIDB", value: "10127071" },
        { "@type": "PropertyValue", propertyID: "NHBRC", value: "3000190954" },
        {
          "@type": "PropertyValue",
          propertyID: "Company Registration",
          value: "2017/135433/07",
        },
        { "@type": "PropertyValue", propertyID: "CSD Supplier", value: "MAAA0446751" },
        { "@type": "PropertyValue", propertyID: "B-BBEE Level", value: "1" },
      ],
    },
  },
} as const;

export type SiteConfig = typeof SITE;
