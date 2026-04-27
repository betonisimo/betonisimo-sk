// src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin-ext"],
  display: 'swap'
});

// ZÁKLADNÁ URL (Dôležité pre správne fungovanie obrázkov na sociálnych sieťach)
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://betonissimo.sk";

// POKROČILÉ SEO METADÁTA
// src/app/layout.js
export const metadata = {
  title: {
    default: "BETONISSIMO.SK | Prémiové betónové ploty",
    template: "%s | BETONISSIMO.SK"
  },
  description: "Zabezpečujeme predaj a profesionálnu montáž betónových plotov po celom Slovensku. Tradičná kvalita, moderný dizajn a ploty, ktoré vydržia generácie.",
  keywords: ["betónové ploty", "ploty na kľúč", "montáž plotov", "betónový plot cena", "oplotenie pozemku", "BART Complex s.r.o.", "Jelka", "Slovensko"],
  authors: [{ name: "BART Complex s.r.o." }],
  creator: "BART Complex s.r.o.",
  
  // OPEN GRAPH (Pre zdieľanie odkazov - Facebook, WhatsApp, LinkedIn)
  openGraph: {
    type: "website",
    locale: "sk_SK",
    url: baseUrl,
    title: "BETTONISSIMO - Betónové ploty a záhradné doplnky | Kvalita a dizajn pre váš domov",
    description: "Najlepšie betónové ploty na Slovensku. Od zamerania až po profesionálnu montáž.",
    siteName: "Beton-SK",
    images: [
      {
        url: "/og-image.jpg", // Vytvor si obrázok 1200x630 a vlož ho do zložky public/
        width: 1200,
        height: 630,
        alt: "Beton-SK Realizácie",
      },
    ],
  },

  // TWITTER CARDS
  twitter: {
    card: "summary_large_image",
    title: "Betónové ploty na kľúč | Beton-SK",
    description: "Prémiové riešenia pre váš dom. Ploty, ktoré vydržia generácie.",
    images: ["/og-image.jpg"],
  },

  // INŠTRUKCIE PRE VYHĽADÁVAČE
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// JSON-LD ŠTRUKTÚROVANÉ DÁTA (Pre Local SEO a Google Maps)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "name": "BART Complex s.r.o. - Beton-SK",
  "image": `${baseUrl}/logo.png`, // Uisti sa, že máš v public/logo.png
  "@id": baseUrl,
  "url": baseUrl,
  "telephone": "0911640097",
  "email": "info@beton-plotysk.sk",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Novojelčanská 845/63",
    "addressLocality": "Jelka",
    "postalCode": "925 23",
    "addressCountry": "SK"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 48.1438, // Uprav na presné súradnice firmy
    "longitude": 17.5028 // Uprav na presné súradnice firmy
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "08:00",
    "closes": "17:00"
  },
  "priceRange": "$$"
};

export default function RootLayout({ children }) {
  return (
    <html lang="sk">
      <head>
        {/* Vloženie štruktúrovaných dát pre Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} antialiased selection:bg-[#dc2626] selection:text-white`}>
  
          <Navbar />
          <main>{children}</main>
          <Footer />
        
      </body>
    </html>
  );
}