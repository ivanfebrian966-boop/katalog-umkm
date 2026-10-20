import NavAdmin from "@/components/NavAdmin";
import { simpanBanner, ubahStatusBanner } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/supabase/session";

function FormBanner({ banner }) {
  return (
    <form action={simpanBanner} className="flex flex-col gap-3 rounded-xl border border-garis p-4">
      {banner ? <input type="hidden" name="id" value={banner.id} /> : null}
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Judul
        <input
          name="judul"
          defaultValue={banner?.judul}
          maxLength={120}
          required
          className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Teks
        <textarea
          name="teks"
          defaultValue={banner?.teks || ""}
          maxLength={1000}
          rows={3}
          className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        URL gambar (opsional, HTTPS atau path lokal)
        <input
          name="gambar_url"
          type="url"
          defaultValue={banner?.gambar_url || ""}
          className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Tautan (opsional, HTTPS atau path lokal)
        <input
          name="tautan"
          defaultValue={banner?.tautan || ""}
          className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="aktif" value="true" defaultChecked={banner ? banner.aktif : true} />
        Tampilkan banner di beranda
      </label>
      <button
        type="submit"
        className="self-start rounded-lg bg-utama px-4 py-2.5 text-sm font-semibold text-white hover:bg-utama-gelap"
      >
        {banner ? "Simpan perubahan" : "Buat banner"}
      </button>
    </form>
  );
}

export default async function HalamanBannerAdmin({ searchParams }) {
  const supabase = await requireAdmin();
  const { status } = await searchParams;
  const { data: daftarBanner, error } = await supabase
    .from("banner_promo")
    .select("id, judul, teks, gambar_url, tautan, aktif, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Banner promo</h1>
        <p className="mt-1 text-sm text-teks-lembut">Hanya banner aktif terbaru yang tampil di beranda.</p>
      </div>
      {status === "tersimpan" ? (
        <p role="status" className="text-sm text-utama">Banner berhasil disimpan.</p>
      ) : status ? (
        <p role="alert" className="text-sm text-bahaya">Data banner tidak valid atau banner tidak ditemukan.</p>
      ) : null}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold">Buat banner baru</h2>
        <FormBanner />
      </section>
      {daftarBanner.map((banner) => (
        <section key={banner.id} className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold">{banner.judul}</h2>
            <form action={ubahStatusBanner}>
              <input type="hidden" name="id" value={banner.id} />
              <input type="hidden" name="aktif" value={String(banner.aktif)} />
              <button type="submit" className="text-sm font-semibold text-utama underline">
                {banner.aktif ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </form>
          </div>
          <FormBanner banner={banner} />
        </section>
      ))}
    </div>
  );
}
