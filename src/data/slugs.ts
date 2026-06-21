// Slugs for static prerender. Kept as a plain module (no asset imports) so it
// can be loaded directly by Node when Vite reads vite.config.ts.
export const projectSlugs = [
  "500-rdp-houses",
  "rural-school-construction",
  "district-clinic-upgrade",
  "msogwaba-water-reticulation",
  "commercial-warehouse",
  "community-hall",
] as const;

export const serviceSlugs = [
  "civil-construction",
  "building-construction",
  "material-supply",
] as const;
