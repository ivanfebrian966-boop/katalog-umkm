export default function MemuatHalaman() {
  return (
    <div aria-live="polite" aria-busy="true" className="flex flex-col gap-5 py-10">
      <p className="text-sm text-teks-lembut">Memuat halaman...</p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="aspect-square animate-pulse rounded-2xl border border-garis bg-permukaan"
          />
        ))}
      </div>
    </div>
  );
}
