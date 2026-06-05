import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 'use cache' direktifini etkinleştirir (cacheTag + updateTag ile tag-bazlı önbellek)
  experimental: {
    useCache: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jwwamaqjcmsvhvswusgz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
