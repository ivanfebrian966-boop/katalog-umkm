"use client";

import { useEffect, useState } from "react";
import KartuProduk from "@/components/KartuProduk";

const STORAGE_KEY = "katalog-umkm-terakhir-dilihat";

function validasiDaftar(nilai) {
  if (!Array.isArray(nilai)) return [];
  return nilai.filter(
    (produk) =>
      produk &&
      /^\d+$/.test(String(produk.id)) &&
      typeof produk.nama === "string" &&
      produk.nama.length <= 200 &&
      Number.isSafeInteger(produk.harga)
  ).slice(0, 8);
}

export function CatatProdukDilihat({ produk }) {
  useEffect(() => {
    try {
      const tersimpan = window.localStorage.getItem(STORAGE_KEY);
      const daftar = validasiDaftar(tersimpan ? JSON.parse(tersimpan) : []);
      const ringkas = {
        id: produk.id,
        nama: produk.nama,
        harga: produk.harga,
        harga_diskon: produk.harga_diskon,
        kategori: produk.kategori,
        foto_url: produk.foto_url,
        foto_urls: produk.foto_urls,
        stok: produk.stok,
        badge: produk.badge,
      };
      const baru = [ringkas, ...daftar.filter((item) => String(item.id) !== String(produk.id))].slice(0, 8);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(baru));
      window.dispatchEvent(new Event("terakhir-dilihat-berubah"));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [produk]);

  return null;
}

export default function BagianTerakhirDilihat() {
  const [daftar, setDaftar] = useState([]);

  useEffect(() => {
    const muatDaftar = () => {
      try {
        const tersimpan = window.localStorage.getItem(STORAGE_KEY);
        setDaftar(validasiDaftar(tersimpan ? JSON.parse(tersimpan) : []));
      } catch {
        setDaftar([]);
      }
    };
    muatDaftar();
    window.addEventListener("storage", muatDaftar);
    window.addEventListener("terakhir-dilihat-berubah", muatDaftar);
    return () => {
      window.removeEventListener("storage", muatDaftar);
      window.removeEventListener("terakhir-dilihat-berubah", muatDaftar);
    };
  }, []);

  if (daftar.length === 0) return null;

  return (
    <section aria-labelledby="judul-terakhir-dilihat" className="flex flex-col gap-5 py-8">
      <h2 id="judul-terakhir-dilihat" className="text-xl font-bold">Terakhir dilihat</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {daftar.slice(0, 4).map((produk) => (
          <KartuProduk key={produk.id} produk={produk} />
        ))}
      </div>
    </section>
  );
}
