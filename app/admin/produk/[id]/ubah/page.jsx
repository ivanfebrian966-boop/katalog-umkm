import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { ubahProduk } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/supabase/session";

export default async function HalamanUbahProduk({ params, searchParams }) {
  const { id } = await params;
  const { status } = await searchParams;
  const supabase = await requireAdmin();
  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const { data: daftarKategori, error: errorKategori } = await supabase
    .from("kategori_toko")
    .select("id, nama")
    .order("nama");
  if (errorKategori) throw errorKategori;

  if (!produk) {
    notFound();
  }

  const pesanStatus =
    status === "input"
      ? "Data produk tidak valid. Periksa nama, harga, stok, dan harga diskon."
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
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      {pesanStatus ? <p role="alert" className="text-sm text-bahaya">{pesanStatus}</p> : null}
      <FormProduk
        action={ubahProduk}
        daftarKategori={daftarKategori || []}
        produk={produk}
        labelTombol="Simpan perubahan"
      />
    </div>
  );
}
