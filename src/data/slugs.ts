// Slugs for static prerender. Plain module with no asset/@-alias imports so
// Node can load it directly when Vite reads vite.config.ts at startup.
export const projectSlugs = [
  "500-rdp-houses",
  "evander-hospital",
  "tholinhlanhla-primary-school",
  "mpumalanga-road-works",
  "commercial-brickwork-package",
] as const;

export const serviceSlugs = [
  "civil-construction",
  "building-construction",
  "material-supply",
] as const;
