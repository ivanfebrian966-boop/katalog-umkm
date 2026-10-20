"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiAI } from "@/app/admin/actions";

export default function FormProduk({ produk = {}, daftarKategori = [], labelTombol, action }) {
  const [nama, setNama] = useState(produk.nama || "");
  const [kategori, setKategori] = useState(produk.kategori || "");
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");
  const [harga, setHarga] = useState(produk.harga === undefined ? "" : String(produk.harga));
  const [stok, setStok] = useState(String(produk.stok ?? 1));
  const [hargaDiskon, setHargaDiskon] = useState(
    produk.harga_diskon === null || produk.harga_diskon === undefined ? "" : String(produk.harga_diskon)
  );
  const [badge, setBadge] = useState(produk.badge || "");
  const [fotoUrls, setFotoUrls] = useState(
    Array.isArray(produk.foto_urls) && produk.foto_urls.length > 0
      ? produk.foto_urls.join("\n")
      : produk.foto_url || ""
  );
  const [pesanAI, setPesanAI] = useState("");
  const [memuatAI, mulaiAI] = useTransition();
  const [state, formAction, menyimpan] = useActionState(action, { errors: {}, values: {} });

  useEffect(() => {
    if (!state.values) return;
    if (typeof state.values.nama === "string") setNama(state.values.nama);
    if (typeof state.values.harga === "string") setHarga(state.values.harga);
    if (typeof state.values.stok === "string") setStok(state.values.stok || "1");
    if (typeof state.values.harga_diskon === "string") setHargaDiskon(state.values.harga_diskon);
    if (typeof state.values.badge === "string") setBadge(state.values.badge);
    if (typeof state.values.kategori === "string") setKategori(state.values.kategori);
    if (typeof state.values.foto_urls === "string") setFotoUrls(state.values.foto_urls);
    if (typeof state.values.deskripsi === "string") setDeskripsi(state.values.deskripsi);
  }, [state]);

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
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {produk.id ? <input type="hidden" name="id" value={produk.id} /> : null}
      <Input
        label="Nama produk"
        name="nama"
        value={nama}
        onChange={(event) => setNama(event.target.value)}
        maxLength={150}
        required
      />
      {state.errors?.nama ? <p role="alert" className="-mt-3 text-sm text-bahaya">{state.errors.nama}</p> : null}
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="1"
        step="1"
        value={harga}
        onChange={(event) => setHarga(event.target.value)}
        required
      />
      {state.errors?.harga ? <p role="alert" className="-mt-3 text-sm text-bahaya">{state.errors.harga}</p> : null}
      <Input
        label="Stok"
        name="stok"
        type="number"
        min="0"
        step="1"
        value={stok}
        onChange={(event) => setStok(event.target.value)}
        required
      />
      {state.errors?.stok ? <p role="alert" className="-mt-3 text-sm text-bahaya">{state.errors.stok}</p> : null}
      <Input
        label="Harga diskon (Rp, opsional)"
        name="harga_diskon"
        type="number"
        min="0"
        step="1"
        value={hargaDiskon}
        onChange={(event) => setHargaDiskon(event.target.value)}
      />
      {state.errors?.harga_diskon ? <p role="alert" className="-mt-3 text-sm text-bahaya">{state.errors.harga_diskon}</p> : null}
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Badge produk
        <select
          name="badge"
          value={badge}
          onChange={(event) => setBadge(event.target.value)}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks"
        >
          <option value="">Tanpa badge</option>
          <option value="Baru">Baru</option>
          <option value="Terlaris">Terlaris</option>
        </select>
      </label>
      {state.errors?.badge ? <p role="alert" className="-mt-3 text-sm text-bahaya">{state.errors.badge}</p> : null}
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
      {state.errors?.kategori ? <p role="alert" className="-mt-3 text-sm text-bahaya">{state.errors.kategori}</p> : null}
      <Input
        label="Link foto (satu per baris)"
        name="foto_urls"
        textarea
        placeholder="https://... atau /produk/nama-file.svg"
        value={fotoUrls}
        onChange={(event) => setFotoUrls(event.target.value)}
      />
      {state.errors?.foto_urls ? <p role="alert" className="-mt-3 text-sm text-bahaya">{state.errors.foto_urls}</p> : null}
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
        maxLength={5000}
      />
      {state.errors?.deskripsi ? <p role="alert" className="-mt-3 text-sm text-bahaya">{state.errors.deskripsi}</p> : null}
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
        <Tombol type="submit" disabled={menyimpan}>
          {menyimpan ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
