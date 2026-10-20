"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createHash } from "node:crypto";
import { createSupabaseSessionClient, requireAdmin } from "@/lib/supabase/session";
import { createServerClient } from "@/lib/supabase";

const percobaanUlasan = new Map();
const JENDELA_RATE_LIMIT = 10 * 60 * 1000;

function lewatiSpamUlasan(kunci, sekarang) {
  const lama = (percobaanUlasan.get(kunci) || []).filter(
    (waktu) => sekarang - waktu < JENDELA_RATE_LIMIT
  );
  if (lama.length >= 3) {
    percobaanUlasan.set(kunci, lama);
    return false;
  }
  lama.push(sekarang);
  percobaanUlasan.set(kunci, lama);
  return true;
}

function bacaDataProduk(formData) {
  const nama = formData.get("nama");
  const harga = formData.get("harga");
  const hargaAngka = Number(harga);
  const kategori = formData.get("kategori");
  const fotoUrl = formData.get("foto_url");
  const daftarFoto = formData.get("foto_urls");
  const deskripsi = formData.get("deskripsi");
  const stok = formData.get("stok");
  const stokAngka = stok === null || stok === "" ? 1 : Number(stok);
  const hargaDiskon = formData.get("harga_diskon");
  const hargaDiskonAngka = hargaDiskon === null || hargaDiskon === "" ? null : Number(hargaDiskon);
  const badge = formData.get("badge");
  const errors = {};
  const nilaiString = (nilai) => (typeof nilai === "string" ? nilai : "");
  const values = {
    nama: nilaiString(nama),
    harga: nilaiString(harga),
    kategori: nilaiString(kategori),
    foto_urls: nilaiString(daftarFoto) || nilaiString(fotoUrl),
    deskripsi: nilaiString(deskripsi),
    stok: nilaiString(stok),
    harga_diskon: nilaiString(hargaDiskon),
    badge: nilaiString(badge),
  };

  if (typeof nama !== "string" || !nama.trim()) errors.nama = "Nama produk wajib diisi.";
  else if (nama.trim().length > 150) errors.nama = "Nama produk maksimal 150 karakter.";
  if (typeof harga !== "string" || !harga.trim() || !Number.isSafeInteger(hargaAngka) || hargaAngka <= 0) {
    errors.harga = "Harga harus berupa bilangan bulat lebih dari 0.";
  }
  if ((stok !== null && typeof stok !== "string") || !Number.isSafeInteger(stokAngka) || stokAngka < 0) {
    errors.stok = "Stok harus berupa bilangan bulat minimal 0.";
  }
  if (
    hargaDiskonAngka !== null &&
    (!Number.isSafeInteger(hargaDiskonAngka) || hargaDiskonAngka <= 0 || hargaDiskonAngka >= hargaAngka)
  ) {
    errors.harga_diskon = "Harga diskon harus lebih dari 0 dan lebih rendah dari harga normal.";
  }
  if (badge !== null && badge !== "" && badge !== "Baru" && badge !== "Terlaris") {
    errors.badge = "Pilih badge yang tersedia.";
  }
  if (typeof kategori === "string" && kategori.length > 80) {
    errors.kategori = "Kategori maksimal 80 karakter.";
  }
  if (typeof deskripsi === "string" && deskripsi.length > 5000) {
    errors.deskripsi = "Deskripsi maksimal 5.000 karakter.";
  }
  if (Object.keys(errors).length > 0) return { errors, values };

  const fotoUrls =
    typeof daftarFoto === "string"
      ? daftarFoto
          .split(/\r?\n/)
          .map((url) => url.trim())
          .filter(Boolean)
      : [];
  const fotoUtama = fotoUrls[0] || (typeof fotoUrl === "string" ? fotoUrl.trim() : "");

  return { errors, values, produk: {
    nama: nama.trim(),
    harga: hargaAngka,
    kategori: typeof kategori === "string" && kategori.trim() ? kategori.trim() : null,
    foto_url: fotoUtama || null,
    foto_urls: fotoUrls,
    deskripsi: typeof deskripsi === "string" && deskripsi.trim() ? deskripsi.trim() : null,
    stok: stokAngka,
    harga_diskon: hargaDiskonAngka,
    badge: typeof badge === "string" && badge ? badge : null,
  } };
}

async function unggahFotoProduk(formData, supabase, produk, urlInputTidakValid) {
  const file = formData.get("foto_file");
  if (file === null || (typeof file !== "string" && file.size === 0)) {
    return { produk, pathUnggahan: null };
  }

  if (typeof file === "string") {
    redirect(`${urlInputTidakValid}?status=file-tidak-valid`);
  }
  if (file.size > 5 * 1024 * 1024) {
    redirect(`${urlInputTidakValid}?status=file-terlalu-besar`);
  }

  const ekstensiPerTipe = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  const ekstensi = ekstensiPerTipe[file.type];
  if (!ekstensi) {
    redirect(`${urlInputTidakValid}?status=file-tidak-valid`);
  }

  const pathUnggahan = `${crypto.randomUUID()}.${ekstensi}`;
  const { error } = await supabase.storage.from("foto-produk").upload(pathUnggahan, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    redirect(`${urlInputTidakValid}?status=unggah-gagal`);
  }

  const { data } = supabase.storage.from("foto-produk").getPublicUrl(pathUnggahan);
  const fotoUrls = [...new Set([...produk.foto_urls, data.publicUrl])];
  return {
    produk: { ...produk, foto_url: fotoUrls[0] || null, foto_urls: fotoUrls },
    pathUnggahan,
  };
}

async function bersihkanUnggahan(supabase, pathUnggahan) {
  if (!pathUnggahan) return;
  const { error } = await supabase.storage.from("foto-produk").remove([pathUnggahan]);
  if (error) throw error;
}

export async function loginAdmin(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    redirect("/admin/login?error=input");
  }

  const requestHeaders = await headers();
  const alamatIp = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const hashIp = createHash("sha256").update(alamatIp).digest("hex");
  const rateLimitClient = createServerClient();
  const { data: bolehLogin, error: errorRateLimit } = await rateLimitClient.rpc(
    "allow_login_attempt",
    { p_ip_hash: hashIp }
  );

  if (errorRateLimit) {
    console.error("Rate limit login tidak tersedia:", errorRateLimit.message);
    redirect("/admin/login?error=unavailable");
  }
  if (!bolehLogin) {
    redirect("/admin/login?error=rate-limit");
  }

  const supabase = await createSupabaseSessionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    redirect("/admin/login?error=credentials");
  }

  const { error: errorBersihkanRateLimit } = await rateLimitClient.rpc(
    "clear_login_attempts",
    { p_ip_hash: hashIp }
  );
  if (errorBersihkanRateLimit) {
    console.error("Penghitung rate limit login tidak dapat dibersihkan:", errorBersihkanRateLimit.message);
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  const supabase = await requireAdmin();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("Sesi tidak dapat diakhiri. Silakan coba lagi.");
  }

  redirect("/admin/login");
}

export async function gantiPasswordAdmin(formData) {
  const supabase = await requireAdmin();
  const passwordBaru = formData.get("password_baru");
  const konfirmasiPassword = formData.get("konfirmasi_password");

  if (typeof passwordBaru !== "string" || passwordBaru.length < 8) {
    redirect("/admin/password?status=pendek");
  }

  if (
    typeof konfirmasiPassword !== "string" ||
    passwordBaru !== konfirmasiPassword
  ) {
    redirect("/admin/password?status=tidak-cocok");
  }

  const { error } = await supabase.auth.updateUser({ password: passwordBaru });

  if (error) {
    redirect("/admin/password?status=gagal");
  }

  redirect("/admin/password?status=berhasil");
}

export async function tambahProduk(previousState, formData) {
  const supabase = await requireAdmin();
  const hasilValidasi = bacaDataProduk(formData);
  if (Object.keys(hasilValidasi.errors).length > 0) return hasilValidasi;
  const dataProduk = hasilValidasi.produk;
  const { produk, pathUnggahan } = await unggahFotoProduk(
    formData,
    supabase,
    dataProduk,
    "/admin/produk/baru"
  );
  const { error } = await supabase.from("produk").insert(produk);

  if (error) {
    await bersihkanUnggahan(supabase, pathUnggahan);
    throw error;
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function ubahProduk(previousState, formData) {
  const supabase = await requireAdmin();
  const id = formData.get("id");
  const hasilValidasi = bacaDataProduk(formData);
  if (Object.keys(hasilValidasi.errors).length > 0) return hasilValidasi;
  const dataProduk = hasilValidasi.produk;

  if (typeof id !== "string" || !/^\d+$/.test(id)) {
    redirect("/admin?status=produk-tidak-valid");
  }

  const { produk, pathUnggahan } = await unggahFotoProduk(formData, supabase, dataProduk, "/admin");
  const { data, error } = await supabase
    .from("produk")
    .update(produk)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    await bersihkanUnggahan(supabase, pathUnggahan);
    throw error;
  }

  if (!data) {
    await bersihkanUnggahan(supabase, pathUnggahan);
    redirect("/admin?status=produk-tidak-ditemukan");
  }

  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);
  redirect("/admin");
}

export async function hapusProduk(formData) {
  const supabase = await requireAdmin();
  const id = formData.get("id");

  if (typeof id !== "string" || !/^\d+$/.test(id)) {
    redirect("/admin?status=produk-tidak-valid");
  }

  const { data, error } = await supabase
    .from("produk")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    redirect("/admin?status=produk-tidak-ditemukan");
  }

  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);
  redirect("/admin");
}

export async function ubahStatusProduk(formData) {
  const supabase = await requireAdmin();
  const id = formData.get("id");
  const aktifSaatIni = formData.get("aktif");

  if (typeof id !== "string" || !/^\d+$/.test(id) || (aktifSaatIni !== "true" && aktifSaatIni !== "false")) {
    redirect("/admin?status=produk-tidak-valid");
  }

  const { data, error } = await supabase
    .from("produk")
    .update({ aktif: aktifSaatIni !== "true" })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) redirect("/admin?status=produk-tidak-ditemukan");

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/produk/${id}`);
  redirect("/admin?status=status-diperbarui");
}

export async function buatDeskripsiAI(nama, kategori) {
  await requireAdmin();

  if (typeof nama !== "string" || !nama.trim() || nama.length > 150) {
    return { error: "Isi nama produk maksimal 150 karakter sebelum membuat deskripsi." };
  }
  if (typeof kategori !== "string" || kategori.length > 80) {
    return { error: "Nama kategori maksimal 80 karakter." };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: "Fitur AI belum dikonfigurasi. Tambahkan GEMINI_API_KEY di environment server." };
  }

  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Tulis deskripsi produk UMKM yang singkat, faktual, dan menarik dalam bahasa Indonesia. Jangan mengarang klaim tentang bahan, manfaat, ukuran, atau kualitas yang tidak diberikan. Nama produk: ${nama.trim()}. Kategori: ${kategori.trim() || "Belum ditentukan"}.`,
                },
              ],
            },
          ],
          generationConfig: { maxOutputTokens: 180, temperature: 0.5 },
        }),
      }
    );
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return { error: "Permintaan AI terlalu lama. Silakan coba lagi." };
    }
    return { error: "Layanan AI tidak dapat dijangkau. Silakan coba lagi." };
  }

  if (!response.ok) {
    return { error: "Layanan AI gagal membuat deskripsi. Silakan periksa konfigurasi atau coba lagi." };
  }

  const hasil = await response.json();
  const deskripsi = hasil.candidates?.[0]?.content?.parts
    ?.map((bagian) => bagian.text || "")
    .join("")
    .trim();

  if (!deskripsi) {
    return { error: "Layanan AI tidak mengembalikan deskripsi. Silakan coba lagi." };
  }

  return { deskripsi };
}

export async function tambahKategori(formData) {
  const supabase = await requireAdmin();
  const nama = formData.get("nama");
  if (typeof nama !== "string" || !nama.trim() || nama.trim().length > 80) {
    redirect("/admin/kategori?status=input");
  }

  const { error } = await supabase.from("kategori_toko").insert({ nama: nama.trim() });
  if (error?.code === "23505") redirect("/admin/kategori?status=duplikat");
  if (error) throw error;

  revalidatePath("/admin/kategori");
  revalidatePath("/admin/produk/baru");
  redirect("/admin/kategori?status=ditambahkan");
}

export async function ubahKategori(formData) {
  const supabase = await requireAdmin();
  const id = formData.get("id");
  const namaBaru = formData.get("nama");
  const namaLama = formData.get("nama_lama");

  if (
    typeof id !== "string" ||
    !/^\d+$/.test(id) ||
    typeof namaBaru !== "string" ||
    !namaBaru.trim() ||
    namaBaru.trim().length > 80 ||
    typeof namaLama !== "string" ||
    !namaLama.trim()
  ) {
    redirect("/admin/kategori?status=input");
  }

  const { data: duplikat, error: errorDuplikat } = await supabase
    .from("kategori_toko")
    .select("id")
    .eq("nama", namaBaru.trim())
    .neq("id", id)
    .maybeSingle();
  if (errorDuplikat) throw errorDuplikat;
  if (duplikat) redirect("/admin/kategori?status=duplikat");

  if (namaBaru.trim() !== namaLama) {
    const { error: errorProduk } = await supabase
      .from("produk")
      .update({ kategori: namaBaru.trim() })
      .eq("kategori", namaLama);
    if (errorProduk) throw errorProduk;

    const { data, error } = await supabase
      .from("kategori_toko")
      .update({ nama: namaBaru.trim() })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      const { error: errorRollback } = await supabase
        .from("produk")
        .update({ kategori: namaLama })
        .eq("kategori", namaBaru.trim());
      if (errorRollback) throw errorRollback;
      if (error) throw error;
      redirect("/admin/kategori?status=tidak-ditemukan");
    }
  }

  revalidatePath("/admin/kategori");
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin/kategori?status=diubah");
}

export async function hapusKategori(formData) {
  const supabase = await requireAdmin();
  const id = formData.get("id");
  const nama = formData.get("nama");
  if (typeof id !== "string" || !/^\d+$/.test(id) || typeof nama !== "string") {
    redirect("/admin/kategori?status=input");
  }

  const { count, error: errorProduk } = await supabase
    .from("produk")
    .select("id", { count: "exact", head: true })
    .eq("kategori", nama);
  if (errorProduk) throw errorProduk;
  if (count > 0) redirect("/admin/kategori?status=masih-dipakai");

  const { data, error } = await supabase
    .from("kategori_toko")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) redirect("/admin/kategori?status=tidak-ditemukan");

  revalidatePath("/admin/kategori");
  redirect("/admin/kategori?status=dihapus");
}

export async function kirimUlasan(formData) {
  const produkId = formData.get("produk_id");
  const nama = formData.get("nama");
  const rating = formData.get("rating");
  const komentar = formData.get("komentar");
  const honeypot = formData.get("website");

  if (
    typeof produkId !== "string" ||
    !/^\d+$/.test(produkId) ||
    typeof nama !== "string" ||
    !nama.trim() ||
    nama.trim().length > 80 ||
    typeof rating !== "string" ||
    !/^[1-5]$/.test(rating) ||
    typeof komentar !== "string" ||
    !komentar.trim() ||
    komentar.trim().length > 1000
  ) {
    redirect(`/produk/${encodeURIComponent(String(produkId || ""))}?ulasan=tidak-valid`);
  }

  if (typeof honeypot === "string" && honeypot.trim()) {
    redirect(`/produk/${encodeURIComponent(produkId)}?ulasan=terkirim`);
  }

  const alamat = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const kunciAnonim = createHash("sha256").update(alamat).digest("hex");
  if (!lewatiSpamUlasan(kunciAnonim, Date.now())) {
    redirect(`/produk/${encodeURIComponent(produkId)}?ulasan=terlalu-sering`);
  }

  const supabase = createServerClient();
  const { data: produk, error: errorProduk } = await supabase
    .from("produk")
    .select("id")
    .eq("id", produkId)
    .eq("aktif", true)
    .maybeSingle();
  if (errorProduk) throw errorProduk;
  if (!produk) redirect("/?ulasan=produk-tidak-ditemukan");

  const { error } = await supabase.from("ulasan_produk").insert({
    produk_id: produkId,
    nama: nama.trim(),
    rating: Number(rating),
    komentar: komentar.trim(),
    tampil: false,
  });
  if (error) throw error;

  revalidatePath(`/produk/${produkId}`);
  redirect(`/produk/${produkId}?ulasan=terkirim`);
}

export async function moderasiUlasan(formData) {
  const supabase = await requireAdmin();
  const id = formData.get("id");
  const tampil = formData.get("tampil");
  if (typeof id !== "string" || !/^\d+$/.test(id) || (tampil !== "true" && tampil !== "false")) {
    redirect("/admin/ulasan?status=input");
  }

  const { data, error } = await supabase
    .from("ulasan_produk")
    .update({ tampil: tampil !== "true" })
    .eq("id", id)
    .select("id, produk_id")
    .maybeSingle();
  if (error) throw error;
  if (!data) redirect("/admin/ulasan?status=tidak-ditemukan");

  revalidatePath("/admin/ulasan");
  revalidatePath(`/produk/${data.produk_id}`);
  redirect("/admin/ulasan?status=diubah");
}

export async function catatKlikPesan(produkId) {
  if (typeof produkId !== "string" || !/^\d+$/.test(produkId)) {
    console.error("Klik pesan WhatsApp diabaikan karena ID produk tidak valid.");
    return;
  }

  try {
    const supabase = createServerClient();
    const { error } = await supabase.from("klik_pesan").insert({ produk_id: produkId });
    if (error) {
      console.error("Gagal mencatat klik pesan WhatsApp:", error.message);
    }
  } catch (error) {
    console.error("Gagal mencatat klik pesan WhatsApp:", error.message);
  }
}

function urlBannerValid(nilai) {
  if (nilai === "") return true;
  if (typeof nilai !== "string" || nilai.length > 2000) return false;
  if (nilai.startsWith("/") && !nilai.startsWith("//")) return true;
  try {
    return new URL(nilai).protocol === "https:";
  } catch {
    return false;
  }
}

export async function simpanBanner(formData) {
  const supabase = await requireAdmin();
  const id = formData.get("id");
  const judul = formData.get("judul");
  const teks = formData.get("teks");
  const gambarUrl = formData.get("gambar_url");
  const tautan = formData.get("tautan");
  const aktif = formData.get("aktif") === "true";

  if (
    typeof judul !== "string" ||
    !judul.trim() ||
    judul.trim().length > 120 ||
    typeof teks !== "string" ||
    teks.length > 1000 ||
    typeof gambarUrl !== "string" ||
    !urlBannerValid(gambarUrl.trim()) ||
    typeof tautan !== "string" ||
    !urlBannerValid(tautan.trim())
  ) {
    redirect("/admin/banner?status=input");
  }

  const nilai = {
    judul: judul.trim(),
    teks: teks.trim() || null,
    gambar_url: gambarUrl.trim() || null,
    tautan: tautan.trim() || null,
    aktif,
  };

  if (typeof id === "string" && id) {
    if (!/^\d+$/.test(id)) redirect("/admin/banner?status=input");
    const { data, error } = await supabase
      .from("banner_promo")
      .update(nilai)
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) redirect("/admin/banner?status=tidak-ditemukan");
  } else {
    const { error } = await supabase.from("banner_promo").insert(nilai);
    if (error) throw error;
  }

  revalidatePath("/admin/banner");
  revalidatePath("/");
  redirect("/admin/banner?status=tersimpan");
}

export async function ubahStatusBanner(formData) {
  const supabase = await requireAdmin();
  const id = formData.get("id");
  const aktif = formData.get("aktif");
  if (typeof id !== "string" || !/^\d+$/.test(id) || (aktif !== "true" && aktif !== "false")) {
    redirect("/admin/banner?status=input");
  }

  const { error } = await supabase
    .from("banner_promo")
    .update({ aktif: aktif !== "true" })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/banner");
  revalidatePath("/");
  redirect("/admin/banner?status=tersimpan");
}