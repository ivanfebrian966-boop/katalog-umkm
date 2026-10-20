"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "katalog-umkm-produk-dibandingkan";
const KonteksBandingkan = createContext(null);

function produkValid(produk) {
  return (
    produk &&
    /^\d+$/.test(String(produk.id)) &&
    typeof produk.nama === "string" &&
    Number.isSafeInteger(produk.harga)
  );
}

export function BandingkanProvider({ children }) {
  const [items, setItems] = useState([]);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    try {
      const tersimpan = window.localStorage.getItem(STORAGE_KEY);
      const nilai = tersimpan ? JSON.parse(tersimpan) : [];
      setItems(Array.isArray(nilai) ? nilai.filter(produkValid).slice(-2) : []);
    } catch {
      setItems([]);
    } finally {
      setSiap(true);
    }
  }, []);

  useEffect(() => {
    if (siap) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        setItems([]);
      }
    }
  }, [items, siap]);

  const nilai = useMemo(
    () => ({
      items,
      siap,
      toggle(produk) {
        setItems((sebelumnya) => {
          if (sebelumnya.some((item) => String(item.id) === String(produk.id))) {
            return sebelumnya.filter((item) => String(item.id) !== String(produk.id));
          }
          return [...sebelumnya, produk].slice(-2);
        });
      },
      isSelected(id) {
        return items.some((item) => String(item.id) === String(id));
      },
    }),
    [items, siap]
  );

  return <KonteksBandingkan.Provider value={nilai}>{children}</KonteksBandingkan.Provider>;
}

export function useBandingkan() {
  const konteks = useContext(KonteksBandingkan);
  if (!konteks) throw new Error("useBandingkan harus digunakan di dalam BandingkanProvider.");
  return konteks;
}
