"use client";

import { useFavorit } from "@/components/FavoritProvider";

export default function TombolFavorit({ produk }) {
  const { isFavorite, toggle } = useFavorit();
  const favorit = isFavorite(produk.id);

  return (
    <button
      type="button"
      aria-pressed={favorit}
      onClick={() => toggle(produk)}
      className="w-full rounded-lg border border-garis px-3 py-2 text-sm font-semibold text-utama hover:border-utama"
    >
      {favorit ? "Hapus dari favorit" : "Tambah ke favorit"}
    </button>
  );
}
