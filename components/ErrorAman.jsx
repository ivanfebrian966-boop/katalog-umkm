"use client";

export default function ErrorAman({ retry, konteks = "halaman" }) {
  return (
    <section className="mx-auto flex max-w-lg flex-col items-start gap-4 py-16">
      <h1 className="text-2xl font-extrabold">Terjadi kendala</h1>
      <p className="text-teks-lembut">
        {konteks === "admin"
          ? "Halaman admin belum dapat dimuat. Coba lagi, atau masuk kembali jika sesi sudah berakhir."
          : "Halaman belum dapat dimuat. Silakan coba lagi beberapa saat."}
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-lg bg-utama px-4 py-2.5 text-sm font-semibold text-white hover:bg-utama-gelap"
      >
        Coba lagi
      </button>
    </section>
  );
}
