import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://selvo.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/transactions", "/budget", "/categories", "/recurring", "/reports", "/splitwise", "/settings", "/admin", "/setup", "/welcome", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
