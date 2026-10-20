import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createSupabaseSessionClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diisi di environment variable (.env.local)."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

export async function requireAdmin() {
  const supabase = await createSupabaseSessionClient();
  let user;
  let error;
  try {
    const hasil = await supabase.auth.getUser();
    user = hasil.data.user;
    error = hasil.error;
  } catch {
    console.error("Pemeriksaan sesi admin gagal; akses ditolak.");
    redirect("/admin/login");
  }

  if (error || !user) {
    redirect("/admin/login");
  }

  return supabase;
}