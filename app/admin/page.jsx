import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { requireAdmin } from "@/lib/supabase/session";

const PRODUK_PER_HALAMAN = 10;

export default async function HalamanAdmin({ searchParams }) {
  const supabase = await requireAdmin();
  const parameter = await searchParams;
  const { status } = parameter;
  const pencarian = typeof parameter.q === "string" ? parameter.q.trim().slice(0, 100) : "";
  const nomorDiminta = Number.parseInt(parameter.halaman, 10);
  const halamanAwal = Number.isSafeInteger(nomorDiminta) && nomorDiminta > 0 ? nomorDiminta : 1;

  let query = supabase
    .from("produk")
    .select("*", { count: "exact" });
  if (pencarian) query = query.ilike("nama", `%${pencarian}%`);
  let hasilProduk = await query
    .order("created_at", { ascending: false })
    .range((halamanAwal - 1) * PRODUK_PER_HALAMAN, halamanAwal * PRODUK_PER_HALAMAN - 1);

  if (hasilProduk.error) {
    throw hasilProduk.error;
  }
  const jumlahProduk = hasilProduk.count || 0;
  const jumlahHalaman = Math.max(1, Math.ceil(jumlahProduk / PRODUK_PER_HALAMAN));
  const halaman = Math.min(halamanAwal, jumlahHalaman);
  if (halaman !== halamanAwal) {
    let queryHalamanAkhir = supabase.from("produk").select("*", { count: "exact" });
    if (pencarian) queryHalamanAkhir = queryHalamanAkhir.ilike("nama", `%${pencarian}%`);
    hasilProduk = await queryHalamanAkhir
      .order("created_at", { ascending: false })
      .range((halaman - 1) * PRODUK_PER_HALAMAN, halaman * PRODUK_PER_HALAMAN - 1);
    if (hasilProduk.error) throw hasilProduk.error;
  }
  const daftarProduk = hasilProduk.data || [];

  const { data: kategoriProduk, error: errorKategori } = await supabase
    .from("produk")
    .select("kategori");
  if (errorKategori) throw errorKategori;
  const jumlahPerKategori = (kategoriProduk || []).reduce((jumlah, produk) => {
      const kategori = produk.kategori || "Tanpa kategori";
      jumlah.set(kategori, (jumlah.get(kategori) || 0) + 1);
      return jumlah;
    }, new Map());

  const paramsNavigasi = new URLSearchParams();
  if (pencarian) paramsNavigasi.set("q", pencarian);
  function tautanHalaman(nomor) {
    const params = new URLSearchParams(paramsNavigasi);
    params.set("halaman", String(nomor));
    return `/admin?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <div className="flex flex-wrap gap-2">
          <Tombol href="/admin/ekspor">Ekspor CSV</Tombol>
          <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
        </div>
      </div>
      {status === "produk-tidak-valid" || status === "input" ? (
        <p role="alert" className="text-sm text-bahaya">
          Data produk tidak valid. Periksa nama dan harga lalu coba lagi.
        </p>
      ) : status === "produk-tidak-ditemukan" ? (
        <p role="alert" className="text-sm text-bahaya">
          Produk tidak ditemukan atau sudah dihapus.
        </p>
      ) : status === "status-diperbarui" ? (
        <p role="status" className="text-sm text-utama">
          Status produk berhasil diperbarui.
        </p>
      ) : null}
      <section aria-labelledby="ringkasan-katalog" className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-4">
        <h2 id="ringkasan-katalog" className="font-bold">Ringkasan katalog</h2>
        <p className="text-2xl font-extrabold">{jumlahProduk} produk</p>
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
      <form action="/admin" className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-56 flex-1 flex-col gap-1.5 text-sm font-semibold">
          Cari produk
          <input
            type="search"
            name="q"
            defaultValue={pencarian}
            placeholder="Nama produk"
            className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base font-normal"
          />
        </label>
        <Tombol type="submit">Cari</Tombol>
        {pencarian ? <Tombol href="/admin" varian="garis">Hapus pencarian</Tombol> : null}
      </form>
      {daftarProduk.length === 0 ? (
        <p className="py-8 text-center text-teks-lembut">
          {pencarian ? "Produk tidak ditemukan." : "Belum ada produk."}
        </p>
      ) : (
        <>
          <TabelProduk daftarProduk={daftarProduk} />
          <nav aria-label="Paginasi produk admin" className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-teks-lembut">
              {jumlahProduk} produk · halaman {halaman} dari {jumlahHalaman}
            </p>
            <div className="flex gap-2">
              <a
                href={tautanHalaman(Math.max(1, halaman - 1))}
                aria-disabled={halaman <= 1}
                className={`rounded-lg border border-garis px-4 py-2.5 text-sm font-semibold ${halaman <= 1 ? "pointer-events-none opacity-50" : "hover:border-utama"}`}
              >
                Sebelumnya
              </a>
              <a
                href={tautanHalaman(Math.min(jumlahHalaman, halaman + 1))}
                aria-disabled={halaman >= jumlahHalaman}
                className={`rounded-lg border border-garis px-4 py-2.5 text-sm font-semibold ${halaman >= jumlahHalaman ? "pointer-events-none opacity-50" : "hover:border-utama"}`}
              >
                Berikutnya
              </a>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
