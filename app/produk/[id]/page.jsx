import Link from "next/link";
import { notFound } from "next/navigation";
import PesanProduk from "@/components/PesanProduk";
import KartuProduk from "@/components/KartuProduk";
import GaleriProduk from "@/components/GaleriProduk";
import BagikanProduk from "@/components/BagikanProduk";
import { CatatProdukDilihat } from "@/components/TerakhirDilihat";
import UlasanProduk from "@/components/UlasanProduk";
import { formatRupiah } from "@/lib/format";
import { createServerClient } from "@/lib/supabase";
import { getPengaturanToko } from "@/lib/toko-server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const toko = await getPengaturanToko();
  const supabase = createServerClient();
  const { data: produk, error } = await supabase
    .from("produk")
    .select("nama, deskripsi, foto_url, foto_urls")
    .eq("id", id)
    .eq("aktif", true)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!produk) {
    return { title: "Produk tidak ditemukan" };
  }

  const foto = produk.foto_urls?.[0] || produk.foto_url;
  return {
    title: produk.nama,
    description: produk.deskripsi || `Lihat detail ${produk.nama} di katalog ${toko.nama}.`,
    openGraph: {
      type: "website",
      title: produk.nama,
      description: produk.deskripsi || `Lihat detail ${produk.nama} di katalog ${toko.nama}.`,
      images: foto ? [{ url: foto, alt: produk.nama }] : [],
    },
  };
}

// US-02: mengambil satu produk dari Supabase berdasarkan id, di sisi server.
export default async function HalamanDetailProduk({ params, searchParams }) {
  const { id } = await params;
  const { ulasan: statusUlasan } = await searchParams;

  const supabase = createServerClient();
  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .eq("aktif", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!produk) {
    notFound();
  }

  const [hasilTerkait, hasilUlasan] = await Promise.all([
    produk.kategori
      ? supabase
          .from("produk")
          .select("*")
          .eq("kategori", produk.kategori)
          .eq("aktif", true)
          .neq("id", produk.id)
          .order("created_at", { ascending: false })
          .limit(4)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("ulasan_produk")
      .select("id, nama, rating, komentar, created_at")
      .eq("produk_id", id)
      .eq("tampil", true)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (hasilTerkait.error) throw hasilTerkait.error;
  if (hasilUlasan.error) throw hasilUlasan.error;
  const produkTerkait = hasilTerkait.data || [];
  const daftarUlasan = hasilUlasan.data || [];

  return (
    <>
      <CatatProdukDilihat produk={produk} />
      <article className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
        <GaleriProduk fotoUrl={produk.foto_url} fotoUrls={produk.foto_urls} nama={produk.nama} />
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
            Kembali ke katalog
          </Link>
          <p className="text-sm text-teks-lembut">{produk.kategori}</p>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{produk.nama}</h1>
          {produk.badge ? (
            <p className="self-start rounded-full bg-utama px-3 py-1 text-sm font-semibold text-white">
              {produk.badge}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            {produk.harga_diskon !== null && produk.harga_diskon !== undefined ? (
              <del className="text-sm text-teks-lembut">{formatRupiah(produk.harga)}</del>
            ) : null}
            <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">
              {formatRupiah(produk.harga_diskon ?? produk.harga)}
            </p>
          </div>
          {produk.stok <= 0 ? <p className="font-semibold text-bahaya">Habis</p> : null}
          <p className="max-w-prose leading-relaxed text-teks-lembut">{produk.deskripsi}</p>
          <PesanProduk produk={produk} />
          <BagikanProduk nama={produk.nama} />
        </div>
      </article>
      {produkTerkait.length > 0 ? (
        <section aria-labelledby="produk-terkait" className="flex flex-col gap-5 pb-10">
          <h2 id="produk-terkait" className="text-xl font-bold">
            Produk terkait
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {produkTerkait.map((produkLain) => (
              <KartuProduk key={produkLain.id} produk={produkLain} />
            ))}
          </div>
        </section>
      ) : null}
      <UlasanProduk produkId={produk.id} ulasan={daftarUlasan} status={statusUlasan} />
    </>
  );
}
