import NavAdmin from "@/components/NavAdmin";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { gantiPasswordAdmin } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/supabase/session";

export default async function HalamanGantiPassword({ searchParams }) {
  await requireAdmin();
  const { status } = await searchParams;
  const pesanStatus = {
    pendek: "Password baru minimal 8 karakter.",
    "tidak-cocok": "Konfirmasi password tidak sama.",
    gagal: "Password belum berhasil diubah. Silakan coba lagi.",
    berhasil: "Password berhasil diubah.",
  }[status];
  const berhasil = status === "berhasil";

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Ganti password</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Ganti password bawaan segera setelah pertama kali masuk. Minimal 8 karakter.
        </p>
      </div>
      <form action={gantiPasswordAdmin} className="flex max-w-sm flex-col gap-4">
        <Input
          label="Password baru"
          name="password_baru"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Input
          label="Ulangi password baru"
          name="konfirmasi_password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Tombol type="submit" className="self-start">
          Simpan password
        </Tombol>
      </form>
      {pesanStatus ? (
        <p role={berhasil ? "status" : "alert"} className={berhasil ? "text-sm text-utama" : "text-sm text-bahaya"}>
          {pesanStatus}
        </p>
      ) : null}
    </div>
  );
}
