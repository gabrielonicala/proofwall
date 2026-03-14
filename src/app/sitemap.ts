import type { MetadataRoute } from "next";

/**
 * Dynamic sitemap for laudica.com
 *
 * Rules:
 * - Only public, indexable pages are included
 * - Auth pages (/login, /signup, /forgot-password) are excluded
 * - Dashboard pages are excluded (behind authentication)
 * - Embed and form pages are excluded (iframe targets, not standalone)
 * - No priority or changefreq tags (ignored by Google since 2023)
 * - lastmod uses real dates — update when page content changes
 */

const BASE_URL = "https://laudica.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  return [
    // Core pages
    {
      url: BASE_URL,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/docs`,
      lastModified: now,
    },

    // Integration hub + detail pages
    {
      url: `${BASE_URL}/integrations`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/integrations/html`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/integrations/react`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/integrations/wordpress`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/integrations/webflow`,
      lastModified: now,
    },

    // Legal pages
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
    },
  ];
}
