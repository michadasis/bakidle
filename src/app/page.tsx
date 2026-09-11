import type { Metadata } from "next";
import { ModeList } from "@/components/ModeList";

export const metadata: Metadata = {
  title: "Bakidle - Daily Baki Character Guessing Game",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <ModeList />;
}
