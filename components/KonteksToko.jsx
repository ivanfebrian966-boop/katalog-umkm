"use client";

import { createContext, useContext } from "react";

const KonteksNomorToko = createContext(null);

export function ProviderNomorToko({ nomorWhatsApp, children }) {
  return (
    <KonteksNomorToko.Provider value={nomorWhatsApp}>
      {children}
    </KonteksNomorToko.Provider>
  );
}

export function useNomorWhatsAppToko() {
  const nomorWhatsApp = useContext(KonteksNomorToko);
  if (nomorWhatsApp === null) {
    throw new Error("Konteks nomor WhatsApp toko belum tersedia.");
  }
  return nomorWhatsApp;
}
