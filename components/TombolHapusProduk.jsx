"use client";

import { hapusProduk } from "@/app/admin/actions";

export default function TombolHapusProduk({ id }) {
  return (
    <form
      action={hapusProduk}
      onSubmit={(event) => {
        if (!window.confirm("Hapus produk ini? Tindakan ini tidak dapat dibatalkan.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-lg border border-garis bg-latar px-4 py-2.5 text-sm font-semibold text-bahaya transition-colors hover:border-bahaya"
      >
        Hapus
      </button>
    </form>
  );
}
