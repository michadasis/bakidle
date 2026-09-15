import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Game } from "@/components/Game";
import { isModeId, modeById } from "@/game/modes";
import { dateSlugToDayIndex, formatArchiveDate } from "@/game/time";

// The mode segment is bounded (five known ids) but the date is not, so only mode gets a static
// param list; the date half of this route renders on request like its parent.
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string; mode: string }>;
}): Promise<Metadata> {
  const { date, mode } = await params;
  const day = dateSlugToDayIndex(date);
  if (day === null || !isModeId(mode)) return {};
  const m = modeById(mode);
  return {
    title: `Bakidle - Replay ${formatArchiveDate(day)} - ${m.label}`,
    description: `${m.blurb}. Replay Bakidle's ${formatArchiveDate(day)} puzzle - it never affects your streak or stats.`,
    alternates: { canonical: `/replay/${date}/${m.id}` },
  };
}

export default async function ReplayModePage({
  params,
}: {
  params: Promise<{ date: string; mode: string }>;
}) {
  const { date, mode } = await params;
  const day = dateSlugToDayIndex(date);
  if (day === null || !isModeId(mode)) notFound();
  return <Game mode={mode} archiveDay={day} />;
}
