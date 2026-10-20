import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { requireAdmin } from "@/lib/supabase/session";

export default async function HalamanAdmin({ searchParams }) {
  const supabase = await requireAdmin();
  const { status } = await searchParams;
  const { data: daftarProduk, error } = await supabase
    .from("produk")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const jumlahPerKategori = daftarProduk.reduce((jumlah, produk) => {
    const kategori = produk.kategori || "Tanpa kategori";
    jumlah.set(kategori, (jumlah.get(kategori) || 0) + 1);
    return jumlah;
  }, new Map());

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>
      {status === "produk-tidak-valid" || status === "input" ? (
        <p role="alert" className="text-sm text-bahaya">
          Data produk tidak valid. Periksa nama dan harga lalu coba lagi.
        </p>
      ) : status === "produk-tidak-ditemukan" ? (
        <p role="alert" className="text-sm text-bahaya">
          Produk tidak ditemukan atau sudah dihapus.
        </p>
      ) : null}
      <section aria-labelledby="ringkasan-katalog" className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-4">
        <h2 id="ringkasan-katalog" className="font-bold">Ringkasan katalog</h2>
        <p className="text-2xl font-extrabold">{daftarProduk.length} produk</p>
        {jumlahPerKategori.size > 0 ? (
          <ul className="flex flex-wrap gap-2 text-sm text-teks-lembut">
            {[...jumlahPerKategori].map(([kategori, jumlah]) => (
              <li key={kategori} className="rounded-full border border-garis bg-latar px-3 py-1">
                {kategori}: {jumlah}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-teks-lembut">Belum ada kategori produk.</p>
        )}
      </section>
      {daftarProduk.length === 0 ? (
        <p className="py-8 text-center text-teks-lembut">Belum ada produk.</p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
