import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { KeranjangProvider } from "@/components/KeranjangProvider";
import { FavoritProvider } from "@/components/FavoritProvider";
import { TemaProvider } from "@/components/TemaProvider";
import { BandingkanProvider } from "@/components/BandingkanProvider";
import { siteUrl } from "@/lib/site";
import { getPengaturanToko } from "@/lib/toko-server";
import { ProviderNomorToko } from "@/components/KonteksToko";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const konfigurasiToko = await getPengaturanToko();
  return {
    metadataBase: new URL(siteUrl),
    title: konfigurasiToko.nama,
    description: konfigurasiToko.tagline,
  };
}

export default async function RootLayout({ children }) {
  const konfigurasiToko = await getPengaturanToko();
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <ProviderNomorToko nomorWhatsApp={konfigurasiToko.nomorWhatsApp}>
          <TemaProvider>
            <BandingkanProvider>
              <FavoritProvider>
                <KeranjangProvider>
                  <Header toko={konfigurasiToko} />
                  <main className="mx-auto w-full max-w-5xl flex-1 px-4">{children}</main>
                  <Footer toko={konfigurasiToko} />
                </KeranjangProvider>
              </FavoritProvider>
            </BandingkanProvider>
          </TemaProvider>
        </ProviderNomorToko>
      </body>
    </html>
  );
}
