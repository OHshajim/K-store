import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kstore.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/shop",
          "/product/",
          "/about",
          "/journal",
          "/fit-assistant",
          "/terms",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/cart",
          "/checkout",
          "/account",
          "/orders",
          "/track/",
          "/auth/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

