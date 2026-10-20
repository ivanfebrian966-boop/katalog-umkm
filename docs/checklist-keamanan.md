# Checklist Keamanan

Cek semua poin ini sebelum mengumpulkan karya. Poin ini juga dipakai saat penilaian.

- [ ] Buka situs di browser, klik kanan > Inspect > tab Network. Muat ulang halaman: tidak ada permintaan ke alamat `supabase.co`.
- [ ] Cari kata `supabase` dan `NEXT_PUBLIC` di seluruh kode: tidak ada environment variable berawalan `NEXT_PUBLIC_`.
- [ ] File `.env.local` tidak ikut ter-push ke GitHub (cek di halaman repo).
- [ ] Buka `/admin` di jendela penyamaran (incognito) tanpa login: dialihkan ke `/admin/login`.
- [ ] Buka `/admin/password` tanpa login: dialihkan ke `/admin/login`.
- [ ] Login dengan password bawaan: gagal, karena password sudah diganti.
- [ ] RLS di tabel `produk` aktif (Supabase > Table Editor > produk: tidak ada label "RLS disabled").
- [ ] Tidak ada email, password, atau kunci yang ditulis di kode.
- [ ] (Bonus) Aksi tambah, ubah, dan hapus produk ditolak jika tidak login.

## Keamanan lanjutan

- [ ] **K-6 (10 poin):** Aplikasi live mengirim header keamanan yang sesuai, seperti `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, dan `Permissions-Policy`. (10 poin)
- [ ] **K-7 (5 poin):** Tidak ada penggunaan `dangerouslySetInnerHTML`, `eval`, atau `new Function` yang tidak aman. (5 poin)
- [ ] **K-8 (10 poin):** Halaman admin mengirim metadata `noindex` agar tidak diindeks mesin pencari. Perlindungan akses tetap dilakukan dengan autentikasi, bukan `robots.txt`. (10 poin)
- [ ] **K-9 (5 poin):** Error yang ditampilkan kepada pengunjung tidak membocorkan stack trace, kredensial, atau detail internal server. (5 poin)
- [ ] **K-10 (10 poin):** Audit dependensi tidak menemukan kerentanan kritis yang belum ditangani. (10 poin)
- [ ] **K-11 (10 poin):** Content-Security-Policy membatasi sumber konten ke origin yang diperlukan dan diuji pada aplikasi live. (10 poin)
- [ ] **K-12 (10 poin):** Endpoint login atau form penting memiliki rate limit yang diterapkan di server dan diuji terhadap kiriman berulang. (10 poin)
- [ ] **K-13 (10 poin):** Tidak ada `console.log` atau log browser lain yang mencetak password, token, kunci, atau data sensitif. (10 poin)
