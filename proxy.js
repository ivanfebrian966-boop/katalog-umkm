import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function proxy(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const modeDev = process.env.NODE_ENV === "development";
  let supabaseOrigin = "";
  if (process.env.SUPABASE_URL) {
    try {
      supabaseOrigin = new URL(process.env.SUPABASE_URL).origin;
    } catch {
      throw new Error("SUPABASE_URL harus berupa URL yang valid.");
    }
  }
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${modeDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https://*.supabase.co${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const buatRespons = () => {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("Content-Security-Policy", csp);
    return response;
  };

  if (request.nextUrl.pathname === "/admin/login") {
    return buatRespons();
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (
    request.nextUrl.pathname.startsWith("/admin/") ||
    request.nextUrl.pathname === "/admin"
  ) {
    if (!supabaseUrl || !supabasePublishableKey) {
      throw new Error(
        "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diisi di environment variable (.env.local)."
      );
    }

    let response = buatRespons();
    const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = buatRespons();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.headers.set("Content-Security-Policy", csp);
      return redirectResponse;
    }

    return response;
  }

  return buatRespons();
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|woff2?)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
