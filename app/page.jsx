import KartuProduk from "@/components/KartuProduk";
import { toko } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const PRODUK_PER_HALAMAN = 12;
const PILIHAN_URUTAN = new Set(["terbaru", "termurah", "termahal"]);

export default async function HalamanKatalog({ searchParams }) {
  const parameter = await searchParams;
  const pencarian = typeof parameter.q === "string" ? parameter.q.trim().slice(0, 100) : "";
  const kategori = typeof parameter.kategori === "string" ? parameter.kategori.trim() : "";
  const urutan = PILIHAN_URUTAN.has(parameter.urut) ? parameter.urut : "terbaru";
  const halamanDiminta = Number.parseInt(parameter.halaman, 10);
  const halamanAwal = Number.isSafeInteger(halamanDiminta) && halamanDiminta > 0 ? halamanDiminta : 1;
  let daftarProduk = [];
  let daftarKategori = [];
  let jumlahProduk = 0;
  let halaman = halamanAwal;
  let pesanError = null;

  try {
    const supabase = createServerClient();
    const { data: kategoriData, error: errorKategori } = await supabase
      .from("produk")
      .select("kategori")
      .not("kategori", "is", null)
      .order("kategori");

    if (errorKategori) {
      throw errorKategori;
    }

    daftarKategori = [...new Set(kategoriData.map((produk) => produk.kategori).filter(Boolean))];
    const ambilHalaman = async (nomorHalaman) => {
      let query = supabase.from("produk").select("*", { count: "exact" });

      if (pencarian) {
        query = query.ilike("nama", `%${pencarian}%`);
      }
      if (kategori) {
        query = query.eq("kategori", kategori);
      }

      if (urutan === "termurah") {
        query = query.order("harga", { ascending: true }).order("id", { ascending: true });
      } else if (urutan === "termahal") {
        query = query.order("harga", { ascending: false }).order("id", { ascending: true });
      } else {
        query = query.order("created_at", { ascending: false }).order("id", { ascending: false });
      }

      const mulai = (nomorHalaman - 1) * PRODUK_PER_HALAMAN;
      return query.range(mulai, mulai + PRODUK_PER_HALAMAN - 1);
    };

    let hasil = await ambilHalaman(halaman);
    if (hasil.error) {
      throw hasil.error;
    }
    jumlahProduk = hasil.count || 0;
    const jumlahHalaman = Math.max(1, Math.ceil(jumlahProduk / PRODUK_PER_HALAMAN));

    if (halaman > jumlahHalaman) {
      halaman = jumlahHalaman;
      hasil = await ambilHalaman(halaman);
      if (hasil.error) {
        throw hasil.error;
      }
    }

    daftarProduk = hasil.data || [];
  } catch {
    pesanError = "Produk belum dapat dimuat. Silakan muat ulang halaman beberapa saat lagi.";
  }

  const jumlahHalaman = Math.max(1, Math.ceil(jumlahProduk / PRODUK_PER_HALAMAN));
  const parameterNavigasi = new URLSearchParams();
  if (pencarian) parameterNavigasi.set("q", pencarian);
  if (kategori) parameterNavigasi.set("kategori", kategori);
  if (urutan !== "terbaru") parameterNavigasi.set("urut", urutan);

  function tautanHalaman(nomor) {
    const params = new URLSearchParams(parameterNavigasi);
    params.set("halaman", String(nomor));
    return `/?${params.toString()}`;
  }

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>
        <form action="/" className="grid gap-3 rounded-xl border border-garis bg-permukaan p-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Cari produk
            <input
              type="search"
              name="q"
              defaultValue={pencarian}
              placeholder="Nama produk"
              className="rounded-lg border border-garis bg-latar px-3 py-2.5 font-normal"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Kategori
            <select
              name="kategori"
              defaultValue={kategori}
              className="rounded-lg border border-garis bg-latar px-3 py-2.5 font-normal"
            >
              <option value="">Semua kategori</option>
              {daftarKategori.map((namaKategori) => (
                <option key={namaKategori} value={namaKategori}>
                  {namaKategori}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Urutkan
            <select
              name="urut"
              defaultValue={urutan}
              className="rounded-lg border border-garis bg-latar px-3 py-2.5 font-normal"
            >
              <option value="terbaru">Terbaru</option>
              <option value="termurah">Termurah</option>
              <option value="termahal">Termahal</option>
            </select>
          </label>
          <button
            type="submit"
            className="self-end rounded-lg bg-utama px-4 py-2.5 text-sm font-semibold text-white hover:bg-utama-gelap"
          >
            Cari
          </button>
        </form>

        {pesanError ? (
          <p className="rounded-xl border border-garis bg-permukaan p-4 text-sm text-bahaya">
            {pesanError}
          </p>
        ) : daftarProduk.length === 0 ? (
          <p className="py-8 text-center text-teks-lembut">
            {pencarian || kategori ? "Produk tidak ditemukan." : "Belum ada produk."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
        {!pesanError && jumlahProduk > 0 ? (
          <nav aria-label="Paginasi produk" className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-teks-lembut">
              {jumlahProduk} produk · halaman {halaman} dari {jumlahHalaman}
            </p>
            <div className="flex items-center gap-2">
              <a
                href={tautanHalaman(Math.max(1, halaman - 1))}
                aria-disabled={halaman <= 1}
                className={`rounded-lg border border-garis px-3 py-2 text-sm ${halaman <= 1 ? "pointer-events-none opacity-50" : "hover:border-utama"}`}
              >
                Sebelumnya
              </a>
              <a
                href={tautanHalaman(Math.min(jumlahHalaman, halaman + 1))}
                aria-disabled={halaman >= jumlahHalaman}
                className={`rounded-lg border border-garis px-3 py-2 text-sm ${halaman >= jumlahHalaman ? "pointer-events-none opacity-50" : "hover:border-utama"}`}
              >
                Berikutnya
              </a>
            </div>
          </nav>
        ) : null}
      </section>
    </>
  );
}
