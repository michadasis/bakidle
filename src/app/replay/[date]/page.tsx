import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModeList } from "@/components/ModeList";
import { dateSlugToDayIndex, formatArchiveDate } from "@/game/time";

// Dates are unbounded and grow by one every day, so this route renders on request rather than
// from a fixed list of build-time params.
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  const day = dateSlugToDayIndex(date);
  if (day === null) return {};
  return {
    title: `Bakidle - Replay ${formatArchiveDate(day)}`,
    description: `Play Bakidle's puzzles from ${formatArchiveDate(day)}. Replay rounds never affect your streak or stats.`,
    alternates: { canonical: `/replay/${date}` },
  };
}

export default async function ReplayDayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const day = dateSlugToDayIndex(date);
  // A malformed date 404s outright. A well-formed but out-of-range one (before day 0, or a date
  // that has not happened yet) is left to the client: "today" is only known after hydration, and
  // guessing it here would either reject a date that turns out to be valid once the clock is read
  // for real, or momentarily accept one that never will be.
  if (day === null) notFound();
  return <ModeList archiveDay={day} />;
}
