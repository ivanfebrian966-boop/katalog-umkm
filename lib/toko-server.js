import { createServerClient } from "@/lib/supabase";
import { toko } from "@/lib/toko";

export async function getPengaturanToko() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("pengaturan_toko")
    .select("nama, tagline, nomor_whatsapp, alamat, jam_buka")
    .eq("id", 1)
    .maybeSingle();

  if (
    error &&
    error.code !== "42P01" &&
    error.code !== "PGRST205" &&
    error.code !== "42703" &&
    error.code !== "PGRST204"
  ) {
    throw error;
  }
  if (!data) return toko;

  return {
    nama: data.nama,
    tagline: data.tagline,
    nomorWhatsApp: data.nomor_whatsapp,
    alamat: data.alamat,
    jamBuka: data.jam_buka,
  };
}
