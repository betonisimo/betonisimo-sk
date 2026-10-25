import { SITE_URL } from "./site-url.js";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const ORGANIZATION_LOGO = `${SITE_URL}/Untitled.png`;

export function serializeJsonLd(value) {
  // Database content must not be able to close the surrounding script element.
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function organizationJsonLd({ phone, showPhone = true } = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "BETONISSIMO.SK",
    url: SITE_URL,
    logo: ORGANIZATION_LOGO,
    ...(showPhone && typeof phone === "string" && phone.trim()
      ? { telephone: phone.trim() }
      : {}),
  };
}

export function accessoryProductJsonLd(accessory) {
  const rawPrice = accessory.price?.toString().trim();
  // Do not manufacture an Offer when no actual price is stored.
  if (!rawPrice || !/^\d+(?:\.\d{1,2})?$/.test(rawPrice)) return null;

  const url = `${SITE_URL}/doplnky/${encodeURIComponent(accessory.slug)}`;
  const images = [...new Set([accessory.mainImage, ...(accessory.gallery || [])])]
    .filter(Boolean)
    .flatMap((image) => {
      try {
        const url = new URL(image, SITE_URL);
        return ["https:", "http:"].includes(url.protocol) ? [url.toString()] : [];
      } catch {
        return [];
      }
    });

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    url,
    name: accessory.title,
    ...(images.length ? { image: images } : {}),
    description: accessory.description,
    brand: { "@type": "Brand", name: "BETONISSIMO.SK" },
    offers: {
      "@type": "Offer",
      url,
      price: rawPrice,
      priceCurrency: "EUR",
      seller: { "@id": ORGANIZATION_ID },
      // Stock, reviews, delivery and returns need real, published business data.
    },
  };
}
