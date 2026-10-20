"use client";

import { useState } from "react";
import { useKeranjang } from "@/components/KeranjangProvider";

export default function TambahKeranjang({ produk }) {
  const { addItem } = useKeranjang();
  const [ditambahkan, setDitambahkan] = useState(false);
  const habis = produk.stok !== undefined && produk.stok <= 0;

  return (
    <button
      type="button"
      disabled={habis}
      onClick={() => {
        addItem(produk);
        setDitambahkan(true);
      }}
      className="w-full rounded-lg border border-garis px-3 py-2 text-sm font-semibold text-utama hover:border-utama disabled:cursor-not-allowed disabled:opacity-50"
    >
      {habis ? "Stok habis" : ditambahkan ? "Ditambahkan ke keranjang" : "Tambah ke keranjang"}
    </button>
  );
}
