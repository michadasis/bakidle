import type { Metadata } from "next";
import "./globals.css";

const SITE = "https://bakidle.vercel.app";
const DESCRIPTION =
  "Guess the daily Baki Hanma character in five modes: Classic stats grid, Quote, Emoji, Splash Art, and Voice Lines. A free daily browser game for fans of Baki the Grappler and Baki Hanma.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Bakidle — Daily Baki Character Guessing Game",
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
    title: "Bakidle — Daily Baki Character Guessing Game",
    description: DESCRIPTION,
    siteName: "Bakidle",
  },
  twitter: {
    card: "summary",
    title: "Bakidle — Daily Baki Character Guessing Game",
    description:
      "Guess the daily Baki Hanma character in five modes: Classic, Quote, Emoji, Splash Art, and Voice Lines.",
  },
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='%230f0b0b'/%3E%3Ccircle cx='50' cy='50' r='48' fill='none' stroke='%23d0342c' stroke-width='4'/%3E%3Ctext x='50' y='68' font-size='58' font-family='Arial Black,Arial,sans-serif' font-weight='900' fill='%23ff5a4e' text-anchor='middle'%3EB%3C/text%3E%3C/svg%3E",
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
      <body>{children}</body>
    </html>
  );
}
