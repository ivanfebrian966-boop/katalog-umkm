import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { tambahProduk } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/supabase/session";

export default async function HalamanTambahProduk({ searchParams }) {
  const supabase = await requireAdmin();
  const { data: daftarKategori, error: errorKategori } = await supabase
    .from("kategori_toko")
    .select("id, nama")
    .order("nama");
  if (errorKategori) throw errorKategori;
  const { status } = await searchParams;
  const pesanStatus =
    status === "input"
      ? "Nama dan harga produk harus diisi dengan nilai yang valid."
      : status === "file-terlalu-besar"
        ? "Ukuran foto melebihi 5 MB. Pilih file yang lebih kecil."
        : status === "file-tidak-valid"
          ? "Pilih file gambar JPEG, PNG, WebP, atau AVIF yang valid."
          : status === "unggah-gagal"
            ? "Foto gagal diunggah. Pastikan Storage sudah disiapkan, lalu coba lagi."
            : null;

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      {pesanStatus ? <p role="alert" className="text-sm text-bahaya">{pesanStatus}</p> : null}
      <FormProduk
        action={tambahProduk}
        daftarKategori={daftarKategori || []}
        labelTombol="Simpan produk"
      />
    </div>
  );
}
