"use client";

import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import { useFavorit } from "@/components/FavoritProvider";

export default function DaftarFavorit() {
  const { items, siap, pesanPenyimpanan } = useFavorit();

  if (!siap) {
    return <p className="py-12 text-center text-teks-lembut">Memuat favorit...</p>;
  }

  return (
    <section className="flex flex-col gap-5 py-8">
      <h1 className="text-2xl font-extrabold">Produk favorit</h1>
      {pesanPenyimpanan ? (
        <p role="status" className="text-sm text-bahaya">
          {pesanPenyimpanan}
        </p>
      ) : null}
      {items.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-teks-lembut">Belum ada produk favorit.</p>
          <Link href="/" className="font-semibold text-utama underline">
            Lihat katalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {items.map((produk) => (
            <KartuProduk key={produk.id} produk={produk} />
          ))}
        </div>
      )}
    </section>
  );
}
