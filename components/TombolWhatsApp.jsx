import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

// US-03: membuka WhatsApp toko dengan pesan otomatis berisi nama dan harga produk.
export default function TombolWhatsApp({ produk }) {
  if (!produk) return null;

  const nomor = String(toko.nomorWhatsApp || "").replace(/\D/g, "");
  const pesan = `Halo, saya mau pesan ${produk.nama} (${formatRupiah(produk.harga)})`;
  const urlWa = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  return (
    <a
      href={urlWa}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
    >
      Pesan via WhatsApp
    </a>
  );
}
