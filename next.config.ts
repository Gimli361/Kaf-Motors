import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 'use cache' direktifini etkinleştirir (cacheTag + updateTag ile tag-bazlı önbellek)
  experimental: {
    useCache: true,
  },
  images: {
    // Next 16: qualities varsayılanı [75]. Galeride quality=90 kullanıldığı için whitelist'e eklenmeli.
    qualities: [75, 90],
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
