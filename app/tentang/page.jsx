import { toko } from "@/lib/toko";

export const metadata = {
  title: `Tentang ${toko.nama}`,
  description: toko.tagline,
};

export default function HalamanTentang() {
  const nomorWhatsApp = String(toko.nomorWhatsApp).replace(/\D/g, "");

  return (
    <article className="flex max-w-prose flex-col gap-5 py-10">
      <h1 className="text-3xl font-extrabold">Tentang {toko.nama}</h1>
      <p className="leading-relaxed text-teks-lembut">{toko.tagline}</p>
      <section className="flex flex-col gap-2">
        <h2 className="font-bold">Alamat</h2>
        <p className="text-teks-lembut">{toko.alamat}</p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="font-bold">Jam buka</h2>
        <p className="text-teks-lembut">{toko.jamBuka}</p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="font-bold">Kontak</h2>
        <a
          href={`https://wa.me/${nomorWhatsApp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start text-utama underline underline-offset-4"
        >
          Hubungi melalui WhatsApp
        </a>
      </section>
    </article>
  );
}
