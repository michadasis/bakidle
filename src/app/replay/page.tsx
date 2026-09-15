import type { Metadata } from "next";
import { ArchiveList } from "@/components/ArchiveList";

export const metadata: Metadata = {
  title: "Bakidle - Replay Past Days",
  description: "Play any past day's Bakidle puzzles. Replay rounds never affect your streak or stats.",
  alternates: { canonical: "/replay" },
};

export default function ReplayPage() {
  return <ArchiveList />;
}
