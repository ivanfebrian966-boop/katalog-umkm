import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import TambahKeranjang from "@/components/TambahKeranjang";
import TombolFavorit from "@/components/TombolFavorit";
import TombolBandingkan from "@/components/TombolBandingkan";

export default function KartuProduk({ produk }) {
  const hargaTampil = produk.harga_diskon ?? produk.harga;
  const stokHabis = produk.stok !== undefined && produk.stok <= 0;
  const foto = produk.foto_urls?.[0] || produk.foto_url;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar">
      <Link href={`/produk/${produk.id}`} className="group flex flex-1 flex-col">
        <img
          src={foto}
          alt={produk.nama}
          className="aspect-square w-full bg-permukaan object-cover"
        />
        <div className="flex flex-1 flex-col gap-2 p-3">
          <p className="text-xs text-teks-lembut">{produk.kategori}</p>
          <h3 className="font-semibold leading-snug group-hover:text-utama">{produk.nama}</h3>
          {produk.badge || stokHabis ? (
            <p className="flex flex-wrap gap-2 text-xs font-semibold">
              {produk.badge ? (
                <span className="rounded-full bg-utama px-2 py-1 text-white">{produk.badge}</span>
              ) : null}
              {stokHabis ? <span className="rounded-full bg-permukaan px-2 py-1 text-bahaya">Habis</span> : null}
            </p>
          ) : null}
          <div className="mt-auto flex flex-wrap items-center gap-2">
            {produk.harga_diskon !== null && produk.harga_diskon !== undefined ? (
              <del className="text-xs text-teks-lembut">{formatRupiah(produk.harga)}</del>
            ) : null}
            <p className="self-start rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">
              {formatRupiah(hargaTampil)}
            </p>
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <div className="flex flex-col gap-2">
          <TambahKeranjang produk={produk} />
          <TombolFavorit produk={produk} />
          <TombolBandingkan produk={produk} />
        </div>
      </div>
    </article>
  );
}
