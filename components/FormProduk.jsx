"use client";

import { useState, useTransition } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiAI } from "@/app/admin/actions";

export default function FormProduk({ produk = {}, daftarKategori = [], labelTombol, action }) {
  const [nama, setNama] = useState(produk.nama || "");
  const [kategori, setKategori] = useState(produk.kategori || "");
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");
  const [fotoUrls, setFotoUrls] = useState(
    Array.isArray(produk.foto_urls) && produk.foto_urls.length > 0
      ? produk.foto_urls.join("\n")
      : produk.foto_url || ""
  );
  const [pesanAI, setPesanAI] = useState("");
  const [memuatAI, mulaiAI] = useTransition();

  function isiDeskripsiOtomatis() {
    setPesanAI("");
    mulaiAI(async () => {
      try {
        const hasil = await buatDeskripsiAI(nama, kategori);
        if (hasil.error) {
          setPesanAI(hasil.error);
          return;
        }
        setDeskripsi(hasil.deskripsi);
      } catch {
        setPesanAI("Deskripsi belum berhasil dibuat. Silakan coba lagi.");
      }
    });
  }

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      {produk.id ? <input type="hidden" name="id" value={produk.id} /> : null}
      <Input
        label="Nama produk"
        name="nama"
        value={nama}
        onChange={(event) => setNama(event.target.value)}
        maxLength={150}
        required
      />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />
      <Input
        label="Stok"
        name="stok"
        type="number"
        min="0"
        step="1"
        defaultValue={produk.stok ?? 1}
        required
      />
      <Input
        label="Harga diskon (Rp, opsional)"
        name="harga_diskon"
        type="number"
        min="0"
        step="1"
        defaultValue={produk.harga_diskon ?? ""}
      />
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Badge produk
        <select
          name="badge"
          defaultValue={produk.badge || ""}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks"
        >
          <option value="">Tanpa badge</option>
          <option value="Baru">Baru</option>
          <option value="Terlaris">Terlaris</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Kategori
        <select
          name="kategori"
          value={kategori}
          onChange={(event) => setKategori(event.target.value)}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks"
        >
          <option value="">Tanpa kategori</option>
          {daftarKategori.map((item) => (
            <option key={item.id} value={item.nama}>
              {item.nama}
            </option>
          ))}
        </select>
      </label>
      <Input
        label="Link foto (satu per baris)"
        name="foto_urls"
        textarea
        placeholder="https://... atau /produk/nama-file.svg"
        value={fotoUrls}
        onChange={(event) => setFotoUrls(event.target.value)}
      />
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Unggah foto dari perangkat (JPEG, PNG, WebP, atau AVIF; maksimal 5 MB)
        <input
          type="file"
          name="foto_file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-sm"
        />
      </label>
      <Input
        label="Deskripsi"
        name="deskripsi"
        textarea
        value={deskripsi}
        onChange={(event) => setDeskripsi(event.target.value)}
      />
      <div className="flex flex-col items-start gap-2">
        <Tombol type="button" varian="garis" onClick={isiDeskripsiOtomatis} disabled={memuatAI}>
          {memuatAI ? "Membuat deskripsi..." : "Buat deskripsi dengan AI"}
        </Tombol>
        {pesanAI ? (
          <p role="alert" className="text-sm text-bahaya">
            {pesanAI}
          </p>
        ) : null}
      </div>
      <div className="flex gap-3">
        <Tombol type="submit">{labelTombol}</Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
