/**
 * Metadata factory for consistent SEO metadata across routes
 * Eliminates duplication and ensures consistency
 */

import type { HeadProps } from "@tanstack/react-router";
import { SITE } from "@/config/site";

export interface MetadataConfig {
  title: string;
  description: string;
  url: string;
  ogImage?: string;
  type?: "website" | "article" | "profile" | "contact";
  twitterCard?: "summary" | "summary_large_image";
  jsonLd?: Record<string, any>;
  canonical?: string;
}

/**
 * Creates a fully configured head object for a route
 */
export function createMetadata(config: MetadataConfig): HeadProps {
  const {
    title,
    description,
    url,
    ogImage = SITE.social.og.image,
    type = "website",
    twitterCard = "summary_large_image",
    jsonLd,
    canonical = url,
  } = config;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:image", content: ogImage },
      { name: "twitter:card", content: twitterCard },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: canonical }],
    ...(jsonLd && {
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ],
    }),
  };
}

/**
 * Creates metadata for article/case study pages
 */
export function createArticleMetadata(
  title: string,
  description: string,
  url: string,
  image: string,
  dateCreated: string,
  organizationName: string = SITE.fullName,
): MetadataConfig {
  return {
    title,
    description,
    url,
    ogImage: image,
    type: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: title,
      description,
      dateCreated,
      image,
      url,
      creator: { "@type": "Organization", name: organizationName },
    },
  };
}

/**
 * Creates metadata for collection pages
 */
export function createCollectionMetadata(
  title: string,
  description: string,
  url: string,
  items: Array<{ name: string; url: string }>,
): MetadataConfig {
  return {
    title,
    description,
    url,
    type: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url,
      hasPart: items.map((item) => ({
        "@type": "CreativeWork",
        name: item.name,
        url: item.url,
      })),
    },
  };
}

/**
 * Creates metadata for contact pages
 */
export function createContactMetadata(title: string, url: string): MetadataConfig {
  return {
    title,
    description: `${SITE.contact.address.city}, ${SITE.contact.address.province} · ${SITE.contact.phoneDisplay} · ${SITE.contact.email}`,
    url,
    type: "contact",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: title,
      url,
    },
  };
}