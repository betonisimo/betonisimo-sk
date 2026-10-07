// src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import Script from "next/script";
import AdminScripts from "@/components/admin/AdminScripts";
import CookieBanner from "@/components/CookieBanner";
import { SITE_URL } from "@/lib/site-url";
const inter = Inter({
  subsets: ["latin-ext"],
  display: 'swap',
  variable: '--font-inter',
});

const baseUrl = SITE_URL;

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "BETONISSIMO.SK | Prémiové betónové ploty na kľúč",
    template: "%s | BETONISSIMO.SK"
  },
  description: "Zabezpečujeme predaj a profesionálnu montáž betónových plotov po celom Slovensku. Kvalitné oplotenie, ktoré vydrží generácie. Zameranie a nacenenie zdarma.",
  keywords: ["betónové ploty", "betónový plot cena", "montáž plotov", "ploty na kľúč", "oplotenie Trnava"],
  authors: [{ name: "BETONISSIMO.SK" }],

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
  "@type": "Organization",
  "name": "BETONISSIMO.SK",
  "image": `${baseUrl}/logo.png`,
  "@id": baseUrl,
  "url": baseUrl,
  "telephone": "+421911640097"
};

export default async function RootLayout({ children }) {
  const [scriptSettings, footerSettings] = await Promise.all([
    prisma.globalSettings.findUnique({
      where: { key: "analytics_scripts" }
    }),
    prisma.strankaObsah.findUnique({
      where: { sekcia: "footer" }
    }),
  ]);

  const footerData = footerSettings?.obsah;
  const navigationPhone = typeof footerData?.tel === "string" && footerData.tel.trim()
    ? footerData.tel
    : "0911 640 097";
  const showNavigationPhone = footerData?.show_tel !== false;

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
          <Navbar phone={navigationPhone} showPhone={showNavigationPhone} />
          <main>{children}</main>
          <Footer />
          <CookieBanner /> {/* Подключаем сюда */}
        </body>
    </html>
  );
}
