import Link from "next/link";

/**
 * Shown on every page from the root layout. The year is read once when the site is built: this
 * is a static export, so a server component never runs again in the browser and cannot disagree
 * with the markup it shipped.
 */
export function Footer() {
  return (
    <footer>
      <p>bakidle.vercel.app - {new Date().getFullYear()}</p>
      <p>
        <Link href="/privacy">Privacy Policy</Link>
      </p>
    </footer>
  );
}
