"use client";

import Link from "next/link";
import { useKeranjang } from "@/components/KeranjangProvider";

export default function TautanKeranjang() {
  const { items } = useKeranjang();
  const jumlah = items.reduce((total, item) => total + item.jumlah, 0);

  return (
    <Link href="/keranjang" className="text-sm font-semibold text-utama hover:underline">
      Keranjang ({jumlah})
    </Link>
  );
}
