import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  images: {
    // Hanya bucket publik foto produk. Bucket bukti antar dan refund privat, jadi tidak lewat next/image.
    remotePatterns: supabaseUrl
      ? [new URL("/storage/v1/object/public/product-images/**", supabaseUrl)]
      : [],
  },
  async headers() {
    return [
      {
        // Token di URL halaman status tidak boleh ikut terkirim ke situs lain lewat Referer (PRD 6.4).
        source: "/pesanan/:token*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
