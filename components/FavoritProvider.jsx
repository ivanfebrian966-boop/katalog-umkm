"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "katalog-umkm-favorit";
const KonteksFavorit = createContext(null);

export function FavoritProvider({ children }) {
  const [items, setItems] = useState([]);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    try {
      const tersimpan = window.localStorage.getItem(STORAGE_KEY);
      if (tersimpan) {
        const daftar = JSON.parse(tersimpan);
        if (Array.isArray(daftar)) {
          setItems(daftar.filter((item) => item && item.id !== undefined && typeof item.nama === "string"));
        }
      }
    } catch {
      setItems([]);
    } finally {
      setSiap(true);
    }
  }, []);

  useEffect(() => {
    if (siap) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, siap]);

  const nilai = useMemo(
    () => ({
      items,
      siap,
      isFavorite(id) {
        return items.some((item) => String(item.id) === String(id));
      },
      toggle(produk) {
        setItems((sebelumnya) =>
          sebelumnya.some((item) => String(item.id) === String(produk.id))
            ? sebelumnya.filter((item) => String(item.id) !== String(produk.id))
            : [...sebelumnya, produk]
        );
      },
    }),
    [items, siap]
  );

  return <KonteksFavorit.Provider value={nilai}>{children}</KonteksFavorit.Provider>;
}

export function useFavorit() {
  const konteks = useContext(KonteksFavorit);
  if (!konteks) throw new Error("useFavorit harus digunakan di dalam FavoritProvider.");
  return konteks;
}
