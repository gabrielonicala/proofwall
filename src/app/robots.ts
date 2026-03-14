import type { MetadataRoute } from "next";

/**
 * robots.txt configuration for laudica.com
 *
 * Allows all crawlers on public pages.
 * Blocks dashboard, embed, form, and auth routes from indexing.
 * References the dynamic sitemap.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/embed/",
          "/form/",
          "/login",
          "/signup",
          "/forgot-password",
        ],
      },
    ],
    sitemap: "https://laudica.com/sitemap.xml",
  };
}
