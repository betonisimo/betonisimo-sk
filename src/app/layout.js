// src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import Script from "next/script";
import AdminScripts from "@/components/admin/AdminScripts";
import CookieBanner from "@/components/CookieBanner";
const inter = Inter({
  subsets: ["latin-ext"],
  display: 'swap',
  variable: '--font-inter',
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://betonissimo.sk";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "BETONISSIMO.SK | Prémiové betónové ploty na kľúč",
    template: "%s | BETONISSIMO.SK"
  },
  description: "Zabezpečujeme predaj a profesionálnu montáž betónových plotov po celom Slovensku. Kvalitné oplotenie, ktoré vydrží generácie. Zameranie a nacenenie zdarma.",
  keywords: ["betónové ploty", "betónový plot cena", "montáž plotov", "ploty na kľúč", "oplotenie Trnava", "BART Complex"],
  authors: [{ name: "BART Complex s.r.o." }],

  openGraph: {
    type: "website",
    locale: "sk_SK",
    url: baseUrl,
    title: "BETONISSIMO | Kvalitné betónové ploty s montážou",
    description: "Profesionálna realizácia betónových plotov po celom Slovensku. Pozrite si naše portfólio.",
    siteName: "Betonissimo",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Betónové ploty Betonissimo",
      },
    ],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness", // Zmenené na LocalBusiness pre lepšie výsledky v mapách
  "name": "BART Complex s.r.o. - Betonissimo",
  "image": `${baseUrl}/logo.png`,
  "@id": baseUrl,
  "url": baseUrl,
  "telephone": "+421911640097", // Medzinárodný formát je lepší pre Google
  "email": "info@beton-plotysk.sk",
  "priceRange": "€€",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Novojelčanská 845/63",
    "addressLocality": "Jelka",
    "postalCode": "925 23",
    "addressCountry": "SK"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 48.1438,
    "longitude": 17.5028
  },
  "areaServed": {
    "@type": "Country",
    "name": "Slovakia"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "08:00",
    "closes": "17:00"
  }
};

export default async function RootLayout({ children }) {
  const scriptSettings = await prisma.globalSettings.findUnique({
    where: { key: "analytics_scripts" }
  });

  return (
    <html lang="sk" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* 1. Схема для Google (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

      
      </head>
        <body className={`${inter.className} antialiased selection:bg-red-600 selection:text-white`}>
          <AdminScripts code={scriptSettings?.value} />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CookieBanner /> {/* Подключаем сюда */}
        </body>
    </html>
  );
}