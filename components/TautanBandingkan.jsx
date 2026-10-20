"use client";

import Link from "next/link";
import { useBandingkan } from "@/components/BandingkanProvider";

export default function TautanBandingkan() {
  const { items } = useBandingkan();
  return (
    <Link href="/bandingkan" className="text-sm font-semibold text-utama hover:underline">
      Bandingkan ({items.length}/2)
    </Link>
  );
}
