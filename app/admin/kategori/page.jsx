import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { tambahKategori, ubahKategori, hapusKategori } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/supabase/session";

const pesanPerStatus = {
  input: "Masukkan nama kategori dengan panjang maksimal 80 karakter.",
  duplikat: "Kategori dengan nama itu sudah ada.",
  "masih-dipakai": "Kategori masih digunakan oleh produk. Ubah produk tersebut sebelum menghapus kategori.",
  "tidak-ditemukan": "Kategori tidak ditemukan atau sudah dihapus.",
  ditambahkan: "Kategori berhasil ditambahkan.",
  diubah: "Kategori dan produk terkait berhasil diperbarui.",
  dihapus: "Kategori berhasil dihapus.",
};

export default async function HalamanKategoriAdmin({ searchParams }) {
  const supabase = await requireAdmin();
  const { status } = await searchParams;
  const { data: daftarKategori, error } = await supabase
    .from("kategori_toko")
    .select("id, nama")
    .order("nama");

  if (error) throw error;

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Kelola kategori</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Kategori yang masih dipakai produk tidak dapat dihapus.
        </p>
      </div>
      {pesanPerStatus[status] ? (
        <p
          role={["input", "duplikat", "masih-dipakai", "tidak-ditemukan"].includes(status) ? "alert" : "status"}
          className={`text-sm ${["input", "duplikat", "masih-dipakai", "tidak-ditemukan"].includes(status) ? "text-bahaya" : "text-utama"}`}
        >
          {pesanPerStatus[status]}
        </p>
      ) : null}
      <form action={tambahKategori} className="flex max-w-lg flex-col gap-3 rounded-xl border border-garis p-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Nama kategori baru
          <input
            name="nama"
            maxLength={80}
            required
            className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base"
          />
        </label>
        <Tombol type="submit" className="self-start">Tambah kategori</Tombol>
      </form>
      {daftarKategori.length === 0 ? (
        <p className="text-sm text-teks-lembut">Belum ada kategori. Tambahkan kategori untuk digunakan pada produk.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {daftarKategori.map((kategori) => (
            <li key={kategori.id} className="flex flex-wrap items-end gap-3 rounded-xl border border-garis p-4">
              <form action={ubahKategori} className="flex min-w-64 flex-1 flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={kategori.id} />
                <input type="hidden" name="nama_lama" value={kategori.nama} />
                <label className="flex min-w-48 flex-1 flex-col gap-1.5 text-sm font-semibold">
                  Nama kategori
                  <input
                    name="nama"
                    defaultValue={kategori.nama}
                    maxLength={80}
                    required
                    className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base"
                  />
                </label>
                <Tombol type="submit" varian="garis">Simpan nama</Tombol>
              </form>
              <form action={hapusKategori} className="flex">
                <input type="hidden" name="id" value={kategori.id} />
                <input type="hidden" name="nama" value={kategori.nama} />
                <Tombol type="submit" varian="bahaya">Hapus</Tombol>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
