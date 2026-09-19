import type { Metadata } from "next";
import { ModeList } from "@/components/ModeList";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <ModeList />;
}
