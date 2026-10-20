import HalamanBandingkan from "@/components/HalamanBandingkan";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function HalamanBandingkanProduk() {
  const supabase = createServerClient();
  const daftarProduk = [];

  for (let mulai = 0; ; mulai += 1000) {
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, kategori, harga, harga_diskon, deskripsi, foto_url, foto_urls")
      .eq("aktif", true)
      .order("id", { ascending: true })
      .range(mulai, mulai + 999);
    if (error) throw error;
    daftarProduk.push(...(data || []));
    if (!data || data.length < 1000) break;
  }

  return <HalamanBandingkan produkTersedia={daftarProduk} />;
}
