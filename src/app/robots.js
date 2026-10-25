import { SITE_URL } from "../lib/site-url.js";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Allow the public sign-in page to be crawled so its noindex can be read.
      // Private admin pages still require authentication independently of robots.
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
