import Link from "next/link";

/**
 * The title at the top of every page. An h1 holding the wordmark image rather than styled text,
 * so the page still has its heading and the logo reads as "Bakidle" to a screen reader. It links
 * back to the mode list, except on the mode list itself where there is nowhere to go.
 */
export function SiteLogo({ link = true }: { link?: boolean }) {
  const image = <img src="/logo/bakidle-wordmark.webp" alt="Bakidle" width={1024} height={293} />;
  return (
    <h1 className="site-logo">
      {link ? (
        <Link href="/" title="Back to the modes">
          {image}
        </Link>
      ) : (
        image
      )}
    </h1>
  );
}
