"use client";

import { useState } from "react";

export default function GaleriProduk({ fotoUrl, fotoUrls = [], nama }) {
  const daftarFoto = [...new Set([...(fotoUrls || []), fotoUrl].filter(Boolean))];
  const [fotoAktif, setFotoAktif] = useState(daftarFoto[0] || "");

  if (!fotoAktif) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-garis bg-permukaan text-sm text-teks-lembut">
        Foto produk belum tersedia
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <img
        src={fotoAktif}
        alt={nama}
        className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover"
      />
      {daftarFoto.length > 1 ? (
        <div className="flex flex-wrap gap-2" aria-label="Foto produk">
          {daftarFoto.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setFotoAktif(url)}
              aria-label={`Tampilkan foto ${index + 1}`}
              aria-pressed={fotoAktif === url}
              className={`overflow-hidden rounded-lg border-2 ${fotoAktif === url ? "border-utama" : "border-garis"}`}
            >
              <img src={url} alt="" className="h-16 w-16 object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
