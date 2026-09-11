import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Bakidle - Privacy Policy",
  description:
    "What Bakidle keeps in your browser, what it does not collect, and which other services see a request when you play.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <header>
        <h1>BAKIDLE</h1>
        <p className="subtitle">Privacy Policy</p>
      </header>

      <Link className="back-btn" href="/">
        <Icon name="chevronLeft" /> Modes
      </Link>

      <div className="clue-card legal">
        <p className="legal-updated">Last updated 12 September 2026</p>

        <p>
          Bakidle is a free fan game. There is no account to create and no sign in, and the game
          has no server of its own: everything you do happens in your browser.
        </p>

        <h2>What is kept on your device</h2>
        <p>
          Your progress in each mode, your guess statistics, your streak and your settings are
          saved in your browser using local storage. That data stays on the device you played on.
          It is not sent anywhere, and nobody else can read it.
        </p>
        <p>
          Because it is tied to one browser on one device, it does not follow you to another
          phone or computer. Statistics has a Transfer my data button that turns your progress
          into a code you can copy and paste into Bakidle elsewhere. That code only moves when
          you copy it yourself.
        </p>

        <h2>What is not collected</h2>
        <ul>
          <li>No analytics, and no tracking or advertising code of any kind.</li>
          <li>No cookies are set by the game.</li>
          <li>No names, email addresses or any other personal details are asked for.</li>
          <li>Nothing about how you play is sent off your device.</li>
        </ul>

        <h2>Other services involved in loading the page</h2>
        <p>
          Opening any website means asking other computers for files, and those requests are
          normally logged by whoever runs them, including your IP address and browser. For
          Bakidle that means:
        </p>
        <ul>
          <li>
            <strong>Vercel</strong>, which hosts the site and serves its pages and audio clips.
          </li>
          <li>
            <strong>Google Fonts</strong>, which serves the two display typefaces.
          </li>
          <li>
            <strong>Fandom</strong> and <strong>MyAnimeList</strong>, whose servers hold the
            character art the game shows.
          </li>
        </ul>
        <p>
          Those requests are handled under each company&apos;s own privacy policy. Bakidle sends
          them nothing about you beyond the request for the file itself.
        </p>

        <h2>Removing your data</h2>
        <p>
          Clearing site data for this site in your browser settings erases everything Bakidle has
          saved, including your streak and statistics. There is nothing held anywhere else to
          delete, and the erase cannot be undone unless you exported a transfer code first.
        </p>

        <h2>Changes</h2>
        <p>
          If this policy changes, the date at the top changes with it. The game collecting
          nothing about you is a deliberate choice, not an oversight, so any change here would be
          a change in that choice.
        </p>

        <h2>The game itself</h2>
        <p>
          Bakidle is an unofficial fan project. Baki and its characters belong to Keisuke Itagaki
          and his publishers; the quotes, art and audio are used on that basis.
        </p>
      </div>
    </>
  );
}
