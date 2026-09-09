import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Game } from "@/components/Game";
import { GAME_MODES, isModeId, modeById } from "@/game/modes";

/** One static page per mode, which is what makes /classic a real URL instead of a rewrite. */
export function generateStaticParams() {
  return GAME_MODES.map((m) => ({ mode: m.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mode: string }>;
}): Promise<Metadata> {
  const { mode } = await params;
  if (!isModeId(mode)) return {};
  const m = modeById(mode);
  return {
    title: `${m.label} — Bakidle`,
    description: `${m.blurb}. A daily Baki character guessing game.`,
    alternates: { canonical: `/${m.id}` },
  };
}

export default async function ModePage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params;
  if (!isModeId(mode)) notFound();
  return <Game mode={mode} />;
}
