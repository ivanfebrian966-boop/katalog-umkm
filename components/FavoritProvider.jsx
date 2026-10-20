"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "katalog-umkm-favorit";
const KonteksFavorit = createContext(null);

export function FavoritProvider({ children }) {
  const [items, setItems] = useState([]);
  const [siap, setSiap] = useState(false);
  const [pesanPenyimpanan, setPesanPenyimpanan] = useState("");

  useEffect(() => {
    try {
      const tersimpan = window.localStorage.getItem(STORAGE_KEY);
      if (tersimpan) {
        const daftar = JSON.parse(tersimpan);
        if (Array.isArray(daftar)) {
          setItems(
            daftar
              .filter(
                (item) =>
                  item &&
                  (typeof item.id === "string" || typeof item.id === "number") &&
                  typeof item.nama === "string" &&
                  Number.isSafeInteger(item.harga) &&
                  item.harga >= 0
              )
              .map((item) => ({
                id: item.id,
                nama: item.nama,
                harga: item.harga,
                harga_diskon:
                  Number.isSafeInteger(item.harga_diskon) && item.harga_diskon >= 0
                    ? item.harga_diskon
                    : null,
                kategori: typeof item.kategori === "string" ? item.kategori : null,
                foto_url: typeof item.foto_url === "string" ? item.foto_url : null,
                foto_urls: Array.isArray(item.foto_urls)
                  ? item.foto_urls.filter((url) => typeof url === "string")
                  : [],
                stok: Number.isSafeInteger(item.stok) ? item.stok : 1,
                badge: typeof item.badge === "string" ? item.badge : null,
              }))
          );
        }
      }
    } catch {
      setItems([]);
      setPesanPenyimpanan("Favorit tersimpan tidak dapat dibaca dari browser ini.");
    } finally {
      setSiap(true);
    }
  }, []);

  useEffect(() => {
    if (!siap) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setPesanPenyimpanan("");
    } catch {
      setPesanPenyimpanan("Perubahan favorit hanya tersimpan sementara di halaman ini.");
    }
  }, [items, siap]);

  const nilai = useMemo(
    () => ({
      items,
      siap,
      pesanPenyimpanan,
      isFavorite(id) {
        return items.some((item) => String(item.id) === String(id));
      },
      toggle(produk) {
        if (!produk || (typeof produk.id !== "string" && typeof produk.id !== "number")) return;
        setItems((sebelumnya) => {
          if (sebelumnya.some((item) => String(item.id) === String(produk.id))) {
            return sebelumnya.filter((item) => String(item.id) !== String(produk.id));
          }
          if (typeof produk.nama !== "string" || !Number.isSafeInteger(produk.harga)) {
            return sebelumnya;
          }
          return [
            ...sebelumnya,
            {
              id: produk.id,
              nama: produk.nama,
              harga: produk.harga,
              harga_diskon: produk.harga_diskon ?? null,
              kategori: produk.kategori ?? null,
              foto_url: produk.foto_url ?? null,
              foto_urls: Array.isArray(produk.foto_urls) ? produk.foto_urls : [],
              stok: produk.stok ?? 1,
              badge: produk.badge ?? null,
            },
          ];
        });
      },
    }),
    [items, siap, pesanPenyimpanan]
  );

  return <KonteksFavorit.Provider value={nilai}>{children}</KonteksFavorit.Provider>;
}

export function useFavorit() {
  const konteks = useContext(KonteksFavorit);
  if (!konteks) throw new Error("useFavorit harus digunakan di dalam FavoritProvider.");
  return konteks;
}
