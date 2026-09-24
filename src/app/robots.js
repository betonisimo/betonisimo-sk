export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/auth/"],
    },
    sitemap: "https://www.betonissimo.sk/sitemap.xml",
  };
}
