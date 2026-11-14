import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // 90 is used for the big photos (hero circles, dish viewer); 75 is the usual
  images: { qualities: [75, 90] },
};

export default nextConfig;
