"use client";

import Link from "next/link";
import { useFavorit } from "@/components/FavoritProvider";

export default function TautanFavorit() {
  const { items } = useFavorit();
  return (
    <Link href="/favorit" className="text-sm font-semibold text-utama hover:underline">
      Favorit ({items.length})
    </Link>
  );
}
