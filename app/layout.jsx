import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { KeranjangProvider } from "@/components/KeranjangProvider";
import { FavoritProvider } from "@/components/FavoritProvider";
import { TemaProvider } from "@/components/TemaProvider";
import { BandingkanProvider } from "@/components/BandingkanProvider";
import { toko } from "@/lib/toko";
import { siteUrl } from "@/lib/site";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: toko.nama,
  description: toko.tagline,
};

export default function RootLayout({ children }) {
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
        <TemaProvider>
          <BandingkanProvider>
            <FavoritProvider>
              <KeranjangProvider>
                <Header />
                <main className="mx-auto w-full max-w-5xl flex-1 px-4">{children}</main>
                <Footer />
              </KeranjangProvider>
            </FavoritProvider>
          </BandingkanProvider>
        </TemaProvider>
      </body>
    </html>
  );
}
