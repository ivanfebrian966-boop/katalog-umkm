import { kirimUlasan } from "@/app/admin/actions";

export default function UlasanProduk({ produkId, ulasan, status }) {
  const rataRata =
    ulasan.length > 0
      ? (ulasan.reduce((total, item) => total + item.rating, 0) / ulasan.length).toFixed(1)
      : null;

  const pesanStatus = {
    terkirim: "Terima kasih. Ulasanmu akan tampil setelah ditinjau admin.",
    "tidak-valid": "Periksa nama, rating, dan komentar. Komentar maksimal 1.000 karakter.",
    "terlalu-sering": "Terlalu banyak ulasan dikirim. Silakan coba lagi nanti.",
  }[status];

  return (
    <section aria-labelledby="judul-ulasan" className="flex flex-col gap-5 border-t border-garis py-8">
      <div>
        <h2 id="judul-ulasan" className="text-xl font-bold">Ulasan pelanggan</h2>
        {rataRata ? (
          <p className="mt-1 text-sm text-teks-lembut">
            Rating rata-rata {rataRata} dari 5 ({ulasan.length} ulasan)
          </p>
        ) : (
          <p className="mt-1 text-sm text-teks-lembut">Belum ada ulasan yang ditampilkan.</p>
        )}
      </div>
      {pesanStatus ? (
        <p role={status === "terkirim" ? "status" : "alert"} className={`text-sm ${status === "terkirim" ? "text-utama" : "text-bahaya"}`}>
          {pesanStatus}
        </p>
      ) : null}
      {ulasan.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {ulasan.map((item) => (
            <li key={item.id} className="rounded-xl border border-garis p-4">
              <p className="font-semibold">{item.nama}</p>
              <p aria-label={`Rating ${item.rating} dari 5`} className="text-harga">
                {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-teks-lembut">
                {item.komentar}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
      <form action={kirimUlasan} className="flex max-w-xl flex-col gap-3 rounded-xl border border-garis p-4">
        <h3 className="font-bold">Tulis ulasan</h3>
        <input type="hidden" name="produk_id" value={produkId} />
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Nama
          <input
            name="nama"
            maxLength={80}
            required
            className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Rating
          <select
            name="rating"
            required
            defaultValue="5"
            className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base"
          >
            {[5, 4, 3, 2, 1].map((nilai) => (
              <option key={nilai} value={nilai}>{nilai} dari 5</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Komentar
          <textarea
            name="komentar"
            maxLength={1000}
            rows={4}
            required
            className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base"
          />
        </label>
        <label
          aria-hidden="true"
          className="pointer-events-none absolute -left-[10000px] h-px w-px overflow-hidden"
        >
          Jangan isi kolom ini
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <button
          type="submit"
          className="self-start rounded-lg bg-utama px-4 py-2.5 text-sm font-semibold text-white hover:bg-utama-gelap"
        >
          Kirim ulasan
        </button>
        <p className="text-xs text-teks-lembut">Ulasan akan ditinjau sebelum ditampilkan.</p>
      </form>
    </section>
  );
}
