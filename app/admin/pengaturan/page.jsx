import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { simpanPengaturanToko } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/supabase/session";
import { toko as tokoDefault } from "@/lib/toko";

export default async function HalamanPengaturanToko({ searchParams }) {
  const supabase = await requireAdmin();
  const { status } = await searchParams;
  const { data, error } = await supabase
    .from("pengaturan_toko")
    .select("nama, tagline, nomor_whatsapp, alamat, jam_buka")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;

  const toko = data
    ? {
        nama: data.nama,
        tagline: data.tagline,
        nomorWhatsApp: data.nomor_whatsapp,
        alamat: data.alamat,
        jamBuka: data.jam_buka,
      }
    : tokoDefault;

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Pengaturan toko</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Nomor WhatsApp memakai format internasional tanpa tanda plus, misalnya 6281234567890.
        </p>
      </div>
      {status === "tersimpan" ? (
        <p role="status" className="text-sm text-utama">Pengaturan toko berhasil disimpan.</p>
      ) : status === "input" ? (
        <p role="alert" className="text-sm text-bahaya">Periksa semua kolom dan format nomor WhatsApp.</p>
      ) : null}
      <form action={simpanPengaturanToko} className="flex max-w-xl flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Nama toko
          <input name="nama" defaultValue={toko.nama} maxLength={100} required className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Tagline
          <textarea name="tagline" defaultValue={toko.tagline} maxLength={300} rows={3} required className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Nomor WhatsApp
          <input name="nomor_whatsapp" defaultValue={toko.nomorWhatsApp} inputMode="numeric" maxLength={15} required className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Alamat
          <textarea name="alamat" defaultValue={toko.alamat} maxLength={300} rows={3} required className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Jam buka
          <input name="jam_buka" defaultValue={toko.jamBuka} maxLength={120} required className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base" />
        </label>
        <Tombol type="submit" className="self-start">Simpan pengaturan</Tombol>
      </form>
    </div>
  );
}
