const OTHER_GAMES = [
  { name: "Loldle", domain: "loldle.net", href: "https://loldle.net" },
  { name: "OnePiecedle", domain: "onepiecedle.net", href: "https://onepiecedle.net" },
  { name: "Brawldle", domain: "brawldle.gg", href: "https://brawldle.gg" },
  { name: "AniGuessr", domain: "aniguessr.com", href: "https://aniguessr.com" },
] as const;

/**
 * Shown on the live mode-select page only, above the footer - a nod to the other independent
 * daily-guessing games out there, not a network Bakidle is actually part of. Modeled on Loldle's
 * own "play our other games" hub (a dark pill holding a row of icon-over-name items, no card
 * around each one) in Bakidle's own colors. Each icon is the destination's own favicon, loaded
 * live from a neutral favicon service rather than any artwork copied from their site - the same
 * way a browser tab or bookmark already represents a site by its own icon.
 */
export function OtherGames() {
  return (
    <div className="other-games">
      <p className="other-games-title">Enjoy daily guessing games?</p>
      <div className="other-games-hub">
        {OTHER_GAMES.map((g) => (
          <a key={g.name} href={g.href} target="_blank" rel="noopener noreferrer" className="other-games-item">
            <img
              className="other-games-icon"
              src={`https://www.google.com/s2/favicons?sz=64&domain=${g.domain}`}
              alt=""
              width={36}
              height={36}
              loading="lazy"
            />
            <span className="other-games-name">{g.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
