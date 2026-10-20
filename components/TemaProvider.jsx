"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const KonteksTema = createContext(null);
const STORAGE_KEY = "katalog-umkm-tema";

export function TemaProvider({ children }) {
  const [tema, setTema] = useState("terang");

  useEffect(() => {
    try {
      const temaTersimpan = window.localStorage.getItem(STORAGE_KEY);
      if (temaTersimpan === "gelap" || temaTersimpan === "terang") {
        setTema(temaTersimpan);
      }
    } catch {
      setTema("terang");
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    try {
      window.localStorage.setItem(STORAGE_KEY, tema);
    } catch {
      document.documentElement.dataset.tema = tema;
    }
  }, [tema]);

  const nilai = useMemo(() => ({ tema, setTema }), [tema]);
  return <KonteksTema.Provider value={nilai}>{children}</KonteksTema.Provider>;
}

export function useTema() {
  const konteks = useContext(KonteksTema);
  if (!konteks) throw new Error("useTema harus digunakan di dalam TemaProvider.");
  return konteks;
}
