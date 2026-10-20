"use client";

import { useState } from "react";

export default function BagikanProduk({ nama }) {
  const [pesan, setPesan] = useState("");

  async function bagikan() {
    setPesan("");
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: nama, url });
        setPesan("Link produk siap dibagikan.");
      } else {
        await navigator.clipboard.writeText(url);
        setPesan("Link tersalin.");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setPesan("Link belum dapat dibagikan. Coba salin alamat halaman dari browser.");
      }
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={bagikan}
        className="rounded-lg border border-garis px-4 py-2.5 text-sm font-semibold hover:border-utama"
      >
        Bagikan produk
      </button>
      {pesan ? <p role="status" className="text-sm text-teks-lembut">{pesan}</p> : null}
    </div>
  );
}
