# Skema Database

## Tabel `produk`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | bigint | Nomor unik, dibuat otomatis |
| `nama` | text | Nama produk, wajib diisi |
| `harga` | integer | Harga dalam rupiah, tidak boleh negatif |
| `deskripsi` | text | Penjelasan produk |
| `foto_url` | text | Link gambar produk |
| `foto_urls` | text[] | Link foto untuk galeri produk |
| `kategori` | text | Kelompok produk, misalnya "Camilan" |
| `stok` | integer | Jumlah stok, nilai 0 berarti habis |
| `harga_diskon` | integer | Harga promo opsional, harus lebih rendah dari harga normal |
| `badge` | text | Label opsional "Baru" atau "Terlaris" |
| `aktif` | boolean | Status publik produk; default aktif |
| `created_at` | timestamptz | Waktu dibuat, otomatis |

## Foto produk

Foto unggahan disimpan dalam bucket publik `foto-produk`. Hanya pengguna terautentikasi yang dapat mengunggah, mengubah, atau menghapus objek. Jalankan ulang `docs/schema.sql` di Supabase SQL Editor untuk menerapkan kolom produk tambahan, bucket, dan kebijakan Storage.

## Aturan akses (RLS)

Row Level Security aktif di tabel `produk`.

| Siapa | Baca | Tambah | Ubah | Hapus |
| --- | --- | --- | --- | --- |
| Publik (tanpa login) | Ditolak | Ditolak | Ditolak | Ditolak |
| Admin yang login | Boleh | Boleh | Boleh | Boleh |

Pengunjung tetap bisa melihat katalog karena data dibaca oleh server memakai kunci rahasia, bukan langsung dari browser.

Skrip lengkap ada di `docs/schema.sql`.
