"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "katalog-umkm-keranjang";
const KonteksKeranjang = createContext(null);

export function KeranjangProvider({ children }) {
  const [items, setItems] = useState([]);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    try {
      const tersimpan = window.localStorage.getItem(STORAGE_KEY);
      if (tersimpan) {
        const daftar = JSON.parse(tersimpan);
        if (Array.isArray(daftar)) {
          setItems(
            daftar.filter(
              (item) =>
                item &&
                typeof item.id === "number" &&
                typeof item.nama === "string" &&
                Number.isSafeInteger(item.harga) &&
                Number.isSafeInteger(item.jumlah) &&
                item.jumlah > 0
            )
          );
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setSiap(true);
    }
  }, []);

  useEffect(() => {
    if (siap) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, siap]);

  const nilai = useMemo(
    () => ({
      items,
      siap,
      addItem(produk) {
        const item = {
          id: produk.id,
          nama: produk.nama,
          harga: produk.harga_diskon ?? produk.harga,
          foto_url: produk.foto_urls?.[0] || produk.foto_url || "",
          jumlah: 1,
        };
        setItems((sebelumnya) => {
          const ada = sebelumnya.find((baris) => baris.id === item.id);
          if (ada) {
            return sebelumnya.map((baris) =>
              baris.id === item.id ? { ...baris, jumlah: baris.jumlah + 1 } : baris
            );
          }
          return [...sebelumnya, item];
        });
      },
      setQuantity(id, jumlah) {
        if (!Number.isSafeInteger(jumlah) || jumlah < 1) return;
        setItems((sebelumnya) =>
          sebelumnya.map((item) => (item.id === id ? { ...item, jumlah } : item))
        );
      },
      removeItem(id) {
        setItems((sebelumnya) => sebelumnya.filter((item) => item.id !== id));
      },
    }),
    [items, siap]
  );

  return <KonteksKeranjang.Provider value={nilai}>{children}</KonteksKeranjang.Provider>;
}

export function useKeranjang() {
  const konteks = useContext(KonteksKeranjang);
  if (!konteks) {
    throw new Error("useKeranjang harus digunakan di dalam KeranjangProvider.");
  }
  return konteks;
}
