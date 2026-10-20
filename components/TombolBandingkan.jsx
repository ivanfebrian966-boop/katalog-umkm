"use client";

import { useBandingkan } from "@/components/BandingkanProvider";

export default function TombolBandingkan({ produk }) {
  const { toggle, isSelected } = useBandingkan();
  const terpilih = isSelected(produk.id);

  return (
    <button
      type="button"
      aria-pressed={terpilih}
      onClick={() => toggle(produk)}
      className="w-full rounded-lg border border-garis px-3 py-2 text-sm font-semibold hover:border-utama"
    >
      {terpilih ? "Hapus dari perbandingan" : "Bandingkan"}
    </button>
  );
}
