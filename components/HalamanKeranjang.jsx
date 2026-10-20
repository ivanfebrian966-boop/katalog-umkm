"use client";

import Link from "next/link";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";
import { useKeranjang } from "@/components/KeranjangProvider";
import { catatKlikPesan } from "@/app/admin/actions";

export default function HalamanKeranjang() {
  const { items, siap, setQuantity, removeItem } = useKeranjang();
  const total = items.reduce((jumlah, item) => jumlah + item.harga * item.jumlah, 0);
  const pesan = [
    `Halo, saya ingin memesan ${items.length} jenis produk:`,
    ...items.map(
      (item) => `- ${item.nama} x${item.jumlah}: ${formatRupiah(item.harga * item.jumlah)}`
    ),
    `Total: ${formatRupiah(total)}`,
  ].join("\n");
  const nomor = String(toko.nomorWhatsApp || "").replace(/\D/g, "");
  const urlWhatsApp = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  if (!siap) {
    return <p className="py-12 text-center text-teks-lembut">Memuat keranjang...</p>;
  }

  return (
    <section className="flex flex-col gap-6 py-8">
      <h1 className="text-2xl font-extrabold">Keranjang</h1>
      {items.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-teks-lembut">Keranjangmu masih kosong.</p>
          <Link href="/" className="font-semibold text-utama underline">
            Lihat katalog
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-garis rounded-xl border border-garis">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-4 p-4">
                {item.foto_url ? (
                  <img src={item.foto_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                ) : null}
                <div className="min-w-32 flex-1">
                  <p className="font-semibold">{item.nama}</p>
                  <p className="text-sm text-teks-lembut">{formatRupiah(item.harga)} per produk</p>
                </div>
                <label className="flex flex-col gap-1 text-xs font-semibold">
                  Jumlah
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.jumlah}
                    onChange={(event) => {
                      const jumlah = Number(event.target.value);
                      if (Number.isSafeInteger(jumlah) && jumlah > 0) setQuantity(item.id, jumlah);
                    }}
                    className="w-24 rounded-lg border border-garis bg-latar px-3 py-2 text-base"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-sm font-semibold text-bahaya underline"
                >
                  Hapus
                </button>
                <p className="w-full text-right font-bold sm:w-auto">
                  {formatRupiah(item.harga * item.jumlah)}
                </p>
              </li>
            ))}
          </ul>
          <p className="self-end text-lg font-extrabold">Total: {formatRupiah(total)}</p>
          <a
            href={urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              items.forEach((item) => {
                void catatKlikPesan(String(item.id));
              });
            }}
            className="inline-flex self-start items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap"
          >
            Pesan semua via WhatsApp
          </a>
        </>
      )}
    </section>
  );
}
