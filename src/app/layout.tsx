import type { Metadata } from "next";
import "./globals.css";
import { BfcacheGuard } from "@/components/BfcacheGuard";
import { DomainMove } from "@/components/DomainMove";
import { Footer } from "@/components/Footer";
import { OtherGames } from "@/components/OtherGames";
import { SITE_URL as SITE } from "@/site";

const DESCRIPTION =
  "Guess the daily Baki Hanma character in five modes: Classic stats grid, Quote, Emoji, Splash Art, and Voice Lines. A free daily browser game for fans of Baki the Grappler and Baki Hanma.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Bakidle",
  description: DESCRIPTION,
  keywords: [
    "Bakidle", "Baki", "Baki Hanma", "Baki the Grappler", "Baki quiz",
    "Baki game", "daily character guessing game", "wordle", "dle game",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    title: "Bakidle",
    description: DESCRIPTION,
    siteName: "Bakidle",
  },
  twitter: {
    card: "summary",
    title: "Bakidle",
    description:
      "Guess the daily Baki Hanma character in five modes: Classic, Quote, Emoji, Splash Art, and Voice Lines.",
  },
  other: { "theme-color": "#0a0a0a" },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Bakidle",
  url: SITE,
  description: DESCRIPTION,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body>
        <DomainMove />
        <BfcacheGuard />
        {children}
        <OtherGames />
        <Footer />
      </body>
    </html>
  );
}
