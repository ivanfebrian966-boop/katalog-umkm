import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

function escapeCsv(nilai) {
  const teks = nilai === null || nilai === undefined ? "" : String(nilai);
  const aman = /^[\s]*[=+\-@]/.test(teks) ? `'${teks}` : teks;
  return `"${aman.replaceAll('"', '""')}"`;
}

export async function GET() {
  const supabase = await requireAdmin();
  const produk = [];
  const ukuranBatch = 1000;

  for (let mulai = 0; ; mulai += ukuranBatch) {
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, kategori, harga, harga_diskon, stok, aktif, deskripsi, foto_url, created_at")
      .order("id", { ascending: true })
      .range(mulai, mulai + ukuranBatch - 1);

    if (error) throw error;
    produk.push(...(data || []));
    if (!data || data.length < ukuranBatch) break;
  }

  const kolom = [
    ["id", "ID"],
    ["nama", "Nama produk"],
    ["kategori", "Kategori"],
    ["harga", "Harga (Rp)"],
    ["harga_diskon", "Harga diskon (Rp)"],
    ["stok", "Stok"],
    ["aktif", "Aktif"],
    ["deskripsi", "Deskripsi"],
    ["foto_url", "URL foto"],
    ["created_at", "Dibuat pada"],
  ];
  const barisCsv = [
    kolom.map(([, judul]) => escapeCsv(judul)).join(","),
    ...produk.map((item) => kolom.map(([kunci]) => escapeCsv(item[kunci])).join(",")),
  ];

  return new NextResponse(`\uFEFF${barisCsv.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="produk.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
