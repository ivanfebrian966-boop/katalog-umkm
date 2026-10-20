import { createServerClient } from "@/lib/supabase";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const supabase = createServerClient();
  const daftarProduk = [];
  const ukuranBatch = 1000;

  for (let mulai = 0; ; mulai += ukuranBatch) {
    const { data, error } = await supabase
      .from("produk")
      .select("id, created_at")
      .order("id", { ascending: true })
      .range(mulai, mulai + ukuranBatch - 1);

    if (error) throw error;
    daftarProduk.push(...(data || []));
    if (!data || data.length < ukuranBatch) break;
  }

  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/tentang`, changeFrequency: "monthly", priority: 0.5 },
    ...daftarProduk.map((produk) => ({
      url: `${siteUrl}/produk/${produk.id}`,
      lastModified: produk.created_at ? new Date(produk.created_at) : undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    })),
  ];
}
