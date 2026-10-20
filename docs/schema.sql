-- Skema database Katalog UMKM
-- Cara pakai: Supabase > SQL Editor > New query > tempel seluruh isi file ini > Run.
-- Aman dijalankan ulang.

-- 1. Tabel produk
create table if not exists public.produk (
  id bigint generated always as identity primary key,
  nama text not null,
  harga integer not null check (harga >= 0),
  deskripsi text,
  foto_url text,
  foto_urls text[] not null default '{}',
  kategori text,
  stok integer not null default 1 check (stok >= 0),
  harga_diskon integer check (harga_diskon is null or (harga_diskon >= 0 and harga_diskon < harga)),
  badge text,
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

-- Kolom tambahan untuk galeri foto (US-18); aman dijalankan pada tabel yang sudah ada.
alter table public.produk
  add column if not exists foto_urls text[] not null default '{}';

-- Kolom tambahan untuk stok dan promo (US-19, US-20); aman dijalankan ulang.
alter table public.produk
  add column if not exists stok integer not null default 1,
  add column if not exists harga_diskon integer,
  add column if not exists badge text,
  add column if not exists aktif boolean not null default true;

-- Kategori toko untuk pilihan terkelola di form produk (US-31).
create table if not exists public.kategori_toko (
  id bigint generated always as identity primary key,
  nama text not null unique,
  created_at timestamptz not null default now()
);

alter table public.kategori_toko enable row level security;

drop policy if exists "admin_baca_kategori_toko" on public.kategori_toko;
drop policy if exists "admin_tambah_kategori_toko" on public.kategori_toko;
drop policy if exists "admin_ubah_kategori_toko" on public.kategori_toko;
drop policy if exists "admin_hapus_kategori_toko" on public.kategori_toko;

create policy "admin_baca_kategori_toko" on public.kategori_toko
  for select to authenticated using (true);
create policy "admin_tambah_kategori_toko" on public.kategori_toko
  for insert to authenticated with check (true);
create policy "admin_ubah_kategori_toko" on public.kategori_toko
  for update to authenticated using (true) with check (true);
create policy "admin_hapus_kategori_toko" on public.kategori_toko
  for delete to authenticated using (true);

-- Ulasan pelanggan dimoderasi sebelum tampil di publik (US-38, US-39).
create table if not exists public.ulasan_produk (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  nama text not null,
  rating smallint not null check (rating between 1 and 5),
  komentar text not null,
  tampil boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.ulasan_produk enable row level security;

drop policy if exists "publik_baca_ulasan_tampil" on public.ulasan_produk;
drop policy if exists "admin_baca_semua_ulasan" on public.ulasan_produk;
drop policy if exists "admin_ubah_ulasan" on public.ulasan_produk;
drop policy if exists "admin_hapus_ulasan" on public.ulasan_produk;

create policy "publik_baca_ulasan_tampil" on public.ulasan_produk
  for select to anon using (tampil = true);
create policy "admin_baca_semua_ulasan" on public.ulasan_produk
  for select to authenticated using (true);
create policy "admin_ubah_ulasan" on public.ulasan_produk
  for update to authenticated using (true) with check (true);
create policy "admin_hapus_ulasan" on public.ulasan_produk
  for delete to authenticated using (true);

-- Klik pesan hanya menyimpan ID produk dan waktu, tanpa data pengunjung (US-40).
create table if not exists public.klik_pesan (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.klik_pesan enable row level security;

drop policy if exists "admin_baca_klik_pesan" on public.klik_pesan;
create policy "admin_baca_klik_pesan" on public.klik_pesan
  for select to authenticated using (true);

-- Rate limit login berbasis hash IP; alamat mentah tidak disimpan.
create table if not exists public.login_rate_limit (
  ip_hash text primary key,
  window_started_at timestamptz not null default now(),
  attempt_count integer not null default 0,
  blocked_until timestamptz
);

alter table public.login_rate_limit enable row level security;
revoke all on public.login_rate_limit from public, anon, authenticated;

create or replace function public.allow_login_attempt(p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt public.login_rate_limit%rowtype;
  v_now timestamptz := now();
begin
  if p_ip_hash is null or p_ip_hash !~ '^[a-f0-9]{64}$' then
    return false;
  end if;

  delete from public.login_rate_limit
  where window_started_at < v_now - interval '1 day';

  insert into public.login_rate_limit (ip_hash, window_started_at, attempt_count)
  values (p_ip_hash, v_now, 0)
  on conflict (ip_hash) do nothing;

  select * into v_attempt
  from public.login_rate_limit
  where ip_hash = p_ip_hash
  for update;

  if v_attempt.window_started_at < v_now - interval '15 minutes' then
    update public.login_rate_limit
    set window_started_at = v_now, attempt_count = 1, blocked_until = null
    where ip_hash = p_ip_hash;
    return true;
  end if;

  if v_attempt.blocked_until is not null and v_attempt.blocked_until > v_now then
    return false;
  end if;

  if v_attempt.attempt_count >= 5 then
    update public.login_rate_limit
    set blocked_until = v_now + interval '15 minutes'
    where ip_hash = p_ip_hash;
    return false;
  end if;

  update public.login_rate_limit
  set attempt_count = attempt_count + 1
  where ip_hash = p_ip_hash;
  return true;
end;
$$;

create or replace function public.clear_login_attempts(p_ip_hash text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.login_rate_limit where ip_hash = p_ip_hash;
$$;

revoke all on function public.allow_login_attempt(text) from public, anon, authenticated;
revoke all on function public.clear_login_attempts(text) from public, anon, authenticated;
grant execute on function public.allow_login_attempt(text) to service_role;
grant execute on function public.clear_login_attempts(text) to service_role;

create or replace function public.produk_terlaris_admin()
returns table (produk_id bigint, total_klik bigint)
language sql
security invoker
set search_path = public
as $$
  select klik_pesan.produk_id, count(*) as total_klik
  from public.klik_pesan
  group by klik_pesan.produk_id
  order by total_klik desc, klik_pesan.produk_id
  limit 5;
$$;

revoke all on function public.produk_terlaris_admin() from public, anon;
grant execute on function public.produk_terlaris_admin() to authenticated;

-- Banner promosi yang dikelola admin (US-42).
create table if not exists public.banner_promo (
  id bigint generated always as identity primary key,
  judul text not null,
  teks text,
  gambar_url text,
  tautan text,
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.banner_promo enable row level security;
drop policy if exists "admin_baca_banner_promo" on public.banner_promo;
drop policy if exists "admin_tambah_banner_promo" on public.banner_promo;
drop policy if exists "admin_ubah_banner_promo" on public.banner_promo;
drop policy if exists "admin_hapus_banner_promo" on public.banner_promo;

create policy "admin_baca_banner_promo" on public.banner_promo
  for select to authenticated using (true);
create policy "admin_tambah_banner_promo" on public.banner_promo
  for insert to authenticated with check (true);
create policy "admin_ubah_banner_promo" on public.banner_promo
  for update to authenticated using (true) with check (true);
create policy "admin_hapus_banner_promo" on public.banner_promo
  for delete to authenticated using (true);

-- Pengaturan identitas toko yang dapat diperbarui admin (US-43).
create table if not exists public.pengaturan_toko (
  id smallint primary key check (id = 1),
  nama text not null,
  tagline text not null,
  nomor_whatsapp text not null,
  alamat text not null,
  jam_buka text not null,
  updated_at timestamptz not null default now()
);

alter table public.pengaturan_toko enable row level security;
drop policy if exists "admin_baca_pengaturan_toko" on public.pengaturan_toko;
drop policy if exists "admin_tambah_pengaturan_toko" on public.pengaturan_toko;
drop policy if exists "admin_ubah_pengaturan_toko" on public.pengaturan_toko;

create policy "admin_baca_pengaturan_toko" on public.pengaturan_toko
  for select to authenticated using (true);
create policy "admin_tambah_pengaturan_toko" on public.pengaturan_toko
  for insert to authenticated with check (true);
create policy "admin_ubah_pengaturan_toko" on public.pengaturan_toko
  for update to authenticated using (true) with check (true);

-- 2. Row Level Security
-- Tidak ada izin untuk publik: akses langsung ke tabel dari luar aplikasi ditolak.
-- Hanya admin yang sudah login yang boleh membaca dan mengubah data.
alter table public.produk enable row level security;

drop policy if exists "admin_baca_produk" on public.produk;
drop policy if exists "admin_tambah_produk" on public.produk;
drop policy if exists "admin_ubah_produk" on public.produk;
drop policy if exists "admin_hapus_produk" on public.produk;

create policy "admin_baca_produk" on public.produk
  for select to authenticated using (true);

create policy "admin_tambah_produk" on public.produk
  for insert to authenticated with check (true);

create policy "admin_ubah_produk" on public.produk
  for update to authenticated using (true) with check (true);

create policy "admin_hapus_produk" on public.produk
  for delete to authenticated using (true);

-- 2a. Supabase Storage untuk foto produk (US-29).
insert into storage.buckets (id, name, public)
values ('foto-produk', 'foto-produk', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "admin_unggah_foto_produk" on storage.objects;
drop policy if exists "admin_ubah_foto_produk" on storage.objects;
drop policy if exists "admin_hapus_foto_produk" on storage.objects;

create policy "admin_unggah_foto_produk" on storage.objects
  for insert to authenticated with check (bucket_id = 'foto-produk');

create policy "admin_ubah_foto_produk" on storage.objects
  for update to authenticated using (bucket_id = 'foto-produk') with check (bucket_id = 'foto-produk');

create policy "admin_hapus_foto_produk" on storage.objects
  for delete to authenticated using (bucket_id = 'foto-produk');

-- 3. Data produk awal (hanya diisi jika tabel masih kosong)
insert into public.produk (nama, harga, deskripsi, foto_url, kategori)
select * from (values
  ('Kopi Bubuk Robusta 250 g', 45000, 'Biji robusta disangrai sedang lalu digiling halus. Cocok untuk kopi tubruk dan kopi susu.', '/produk/kopi.svg', 'Minuman'),
  ('Keripik Singkong Balado', 15000, 'Singkong iris tipis, digoreng renyah, dibalut bumbu balado pedas manis.', '/produk/keripik.svg', 'Camilan'),
  ('Sambal Bawang Botol 150 ml', 25000, 'Cabai rawit dan bawang putih goreng dengan minyak, tahan hingga 2 bulan.', '/produk/sambal.svg', 'Bumbu'),
  ('Kue Nastar Toples 500 g', 85000, 'Nastar lembut dengan selai nanas buatan sendiri. Dikemas toples kedap udara.', '/produk/nastar.svg', 'Kue kering'),
  ('Tas Anyaman Pandan', 120000, 'Dianyam tangan dari daun pandan kering, dilapisi kain di bagian dalam.', '/produk/tas.svg', 'Kerajinan'),
  ('Kain Batik Cap 2 m', 175000, 'Batik cap motif parang di atas kain katun primisima, panjang 2 meter.', '/produk/batik.svg', 'Kain')
) as data_awal (nama, harga, deskripsi, foto_url, kategori)
where not exists (select 1 from public.produk);

-- 4. Data tambahan untuk menguji paginasi, urutan, filter, dan pencarian (54 produk).
--    Bersama data awal jadi 60 produk, 10 per kategori, dengan harga dan waktu dibuat berbeda.
--    Hanya diisi sekali; kalau tidak dibutuhkan, hapus dengan:
--    delete from public.produk where deskripsi like 'Contoh untuk uji paginasi%';
with kategori (urut, kategori, foto_url, harga_dasar, langkah, daftar) as (values
  (1, 'Minuman', '/produk/kopi.svg', 20000, 4000, array[
    'Kopi Arabika Gayo 250 g', 'Kopi Luwak Liar 100 g', 'Teh Melati Tubruk 100 g',
    'Wedang Uwuh Isi 10', 'Jahe Merah Instan 250 g', 'Kopi Susu Gula Aren 250 ml',
    'Teh Rosella Kering 50 g', 'Bajigur Instan Isi 5', 'Cokelat Bubuk Murni 200 g']),
  (2, 'Camilan', '/produk/keripik.svg', 10000, 1500, array[
    'Keripik Tempe Original', 'Keripik Pisang Cokelat', 'Rempeyek Kacang 250 g',
    'Basreng Pedas Daun Jeruk', 'Makaroni Bantat Pedas', 'Kerupuk Kulit Sapi 100 g',
    'Emping Melinjo Manis', 'Keripik Kentang Balado', 'Kacang Telur 250 g']),
  (3, 'Bumbu', '/produk/sambal.svg', 18000, 2500, array[
    'Sambal Cumi Asin 150 ml', 'Sambal Teri Medan 150 ml', 'Bumbu Rendang Instan',
    'Bumbu Pecel Kacang 250 g', 'Sambal Matah Botol 150 ml', 'Petis Udang 200 g',
    'Bumbu Rawon Instan', 'Saus Kacang Sate 250 g', 'Terasi Udang Bakar 100 g']),
  (4, 'Kue kering', '/produk/nastar.svg', 60000, 5000, array[
    'Kastengel Keju Toples 500 g', 'Putri Salju Toples 500 g', 'Lidah Kucing Toples 400 g',
    'Kue Semprit Toples 500 g', 'Sagu Keju Toples 400 g', 'Kue Kacang Toples 500 g',
    'Choco Chip Cookies 400 g', 'Bolu Kering Jadul 300 g', 'Kue Bawang 250 g']),
  (5, 'Kerajinan', '/produk/tas.svg', 35000, 15000, array[
    'Dompet Anyaman Rotan', 'Topi Pandan Pantai', 'Keranjang Bambu Serbaguna',
    'Tatakan Gelas Eceng Gondok Isi 6', 'Gantungan Kunci Kayu Ukir', 'Tas Rajut Benang Katun',
    'Vas Bunga Gerabah', 'Sandal Anyaman Mendong', 'Kotak Tisu Kayu Jati']),
  (6, 'Kain', '/produk/batik.svg', 150000, 25000, array[
    'Kain Batik Tulis Lasem 2 m', 'Sarung Tenun Samarinda', 'Kain Tenun Ikat NTT 2 m',
    'Selendang Songket Palembang', 'Kain Lurik Klaten 2 m', 'Batik Kawung Katun 2 m',
    'Kain Jumputan Palembang 2 m', 'Syal Batik Sutra', 'Kain Sasirangan Banjar 2 m'])
)
insert into public.produk (nama, harga, deskripsi, foto_url, kategori, created_at)
select
  p.nama,
  k.harga_dasar + p.ke * k.langkah,
  format('Contoh untuk uji paginasi, urutan, dan pencarian. Produk %s nomor %s.', lower(k.kategori), p.ke),
  k.foto_url,
  k.kategori,
  now() - make_interval(hours => ((k.urut - 1) * 9 + p.ke)::int)
from kategori k
cross join lateral unnest(k.daftar) with ordinality as p (nama, ke)
where not exists (select 1 from public.produk where deskripsi like 'Contoh untuk uji paginasi%');

insert into public.kategori_toko (nama)
select distinct kategori
from public.produk
where kategori is not null and btrim(kategori) <> ''
on conflict (nama) do nothing;
