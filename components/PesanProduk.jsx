"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";
import { catatKlikPesan } from "@/app/admin/actions";

export default function PesanProduk({ produk }) {
  const [jumlah, setJumlah] = useState(1);
  const [varian, setVarian] = useState("");
  const nomor = String(toko.nomorWhatsApp || "").replace(/\D/g, "");
  const hargaTampil = produk.harga_diskon ?? produk.harga;
  const detailVarian = varian.trim() ? `\nVarian/catatan: ${varian.trim()}` : "";
  const pesan = `Halo, saya mau pesan ${produk.nama} (${formatRupiah(hargaTampil)})\nJumlah: ${jumlah}${detailVarian}`;
  const urlWhatsApp = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  return (
    <div className="flex flex-col gap-4">
      <label className="flex max-w-40 flex-col gap-1.5 text-sm font-semibold">
        Jumlah
        <input
          type="number"
          min="1"
          step="1"
          value={jumlah}
          onChange={(event) => {
            const nilai = Number(event.target.value);
            setJumlah(Number.isSafeInteger(nilai) && nilai > 0 ? nilai : 1);
          }}
          className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Varian atau catatan (opsional)
        <input
          type="text"
          value={varian}
          onChange={(event) => setVarian(event.target.value)}
          maxLength={100}
          placeholder="Contoh: rasa pedas"
          className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base"
        />
      </label>
      {produk.stok <= 0 ? (
        <p role="status" className="font-semibold text-bahaya">
          Produk ini sedang habis dan belum bisa dipesan.
        </p>
      ) : (
        <a
          href={urlWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            void catatKlikPesan(String(produk.id));
          }}
          className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
        >
          Pesan via WhatsApp
        </a>
      )}
    </div>
  );
}
