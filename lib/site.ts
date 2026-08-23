export const siteName = 'Workbench Notes';

export const siteDescription =
  'A personal journal about software, design, and the small decisions that make digital products feel considered.';

const configuredSiteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
);

export const siteUrl = new URL(configuredSiteUrl.origin);
