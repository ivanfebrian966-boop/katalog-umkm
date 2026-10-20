"use client";

import { useTema } from "@/components/TemaProvider";

export default function TombolTema() {
  const { tema, setTema } = useTema();

  return (
    <button
      type="button"
      onClick={() => setTema(tema === "gelap" ? "terang" : "gelap")}
      aria-label={tema === "gelap" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      className="text-sm font-semibold text-utama hover:underline"
    >
      {tema === "gelap" ? "Mode terang" : "Mode gelap"}
    </button>
  );
}
