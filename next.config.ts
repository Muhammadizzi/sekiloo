import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  images: {
    // Hanya bucket publik foto produk. Bucket bukti antar dan refund privat, jadi tidak lewat next/image.
    remotePatterns: supabaseUrl
      ? [new URL("/storage/v1/object/public/product-images/**", supabaseUrl)]
      : [],
  },
};

export default nextConfig;
