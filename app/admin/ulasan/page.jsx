import Link from "next/link";
import NavAdmin from "@/components/NavAdmin";
import { moderasiUlasan } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/supabase/session";

export default async function HalamanModerasiUlasan({ searchParams }) {
  const supabase = await requireAdmin();
  const { status } = await searchParams;
  const { data: ulasan, error } = await supabase
    .from("ulasan_produk")
    .select("id, produk_id, nama, rating, komentar, tampil, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Moderasi ulasan</h1>
      {status === "diubah" ? (
        <p role="status" className="text-sm text-utama">Status ulasan berhasil diperbarui.</p>
      ) : status ? (
        <p role="alert" className="text-sm text-bahaya">Ulasan tidak ditemukan atau data tidak valid.</p>
      ) : null}
      {ulasan.length === 0 ? (
        <p className="text-sm text-teks-lembut">Belum ada ulasan untuk ditinjau.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {ulasan.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 rounded-xl border border-garis p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.nama} · {item.rating}/5</p>
                  <p className="text-xs text-teks-lembut">
                    <Link href={`/produk/${item.produk_id}`} className="underline">
                      Lihat produk
                    </Link>
                    {" · "}
                    {new Date(item.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
                <form action={moderasiUlasan}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="tampil" value={String(item.tampil)} />
                  <button
                    type="submit"
                    className={`rounded-lg border border-garis px-3 py-2 text-sm font-semibold ${item.tampil ? "text-bahaya" : "text-utama"}`}
                  >
                    {item.tampil ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </form>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-teks-lembut">{item.komentar}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
