/* eslint-disable @next/next/no-sync-scripts, @next/next/next-script-for-ga -- CookieYes must initialize before the requested GTM snippet in the HTML head. */
// src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import AdminScripts from "@/components/admin/AdminScripts";
import { SITE_URL } from "@/lib/site-url";
import { organizationJsonLd, serializeJsonLd } from "@/lib/structured-data";
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
  const jsonLd = organizationJsonLd({ phone: navigationPhone, showPhone: showNavigationPhone });

  return (
    <html lang="sk" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          id="cookieyes"
          type="text/javascript"
          src="https://cdn-cookieyes.com/client_data/6627460f951d45e71eabce7519db090f/script.js"
        ></script>
        <script
          id="google-tag-manager"
          dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-55MXWFC7');` }}
        ></script>
        {/* 1. Схема для Google (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />

      
      </head>
        <body className={`${inter.className} antialiased selection:bg-red-600 selection:text-white`}>
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-55MXWFC7"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
          <AdminScripts code={scriptSettings?.value} />
          <Navbar phone={navigationPhone} showPhone={showNavigationPhone} />
          <main>{children}</main>
          <Footer data={footerData} />
        </body>
    </html>
  );
}
