"use client";

import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { useBandingkan } from "@/components/BandingkanProvider";

export default function HalamanBandingkan({ produkTersedia }) {
  const { items, siap } = useBandingkan();
  if (!siap) return <p className="py-12 text-center text-teks-lembut">Memuat perbandingan...</p>;

  const produkDenganDataAktif = items
    .map((item) => produkTersedia.find((produk) => String(produk.id) === String(item.id)))
    .filter(Boolean);
  const adaProdukHilang = produkDenganDataAktif.length !== items.length;

  return (
    <section className="flex flex-col gap-6 py-8">
      <h1 className="text-2xl font-extrabold">Bandingkan produk</h1>
      {adaProdukHilang ? (
        <p role="status" className="text-sm text-teks-lembut">
          Beberapa produk tidak lagi tersedia dan tidak ditampilkan dalam perbandingan.
        </p>
      ) : null}
      {produkDenganDataAktif.length < 2 ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-teks-lembut">
            Pilih dua produk dari katalog untuk membandingkannya. Pilihan ketiga akan menggantikan produk yang paling lama dipilih.
          </p>
          <Link href="/" className="font-semibold text-utama underline">Pilih produk</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {produkDenganDataAktif.map((produk) => (
            <article key={produk.id} className="flex flex-col gap-3 rounded-2xl border border-garis p-4">
              <img
                src={produk.foto_urls?.[0] || produk.foto_url}
                alt={produk.nama}
                className="aspect-square w-full rounded-xl bg-permukaan object-cover"
              />
              <h2 className="text-xl font-bold">{produk.nama}</h2>
              <p className="text-sm text-teks-lembut">{produk.kategori || "Tanpa kategori"}</p>
              <p className="font-bold text-harga">
                {formatRupiah(produk.harga_diskon ?? produk.harga)}
              </p>
              <p className="whitespace-pre-wrap leading-relaxed text-teks-lembut">
                {produk.deskripsi || "Deskripsi belum tersedia."}
              </p>
              <Link href={`/produk/${produk.id}`} className="self-start font-semibold text-utama underline">
                Lihat detail
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
