import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // 90 is used for the big photos (hero circles, dish viewer); 75 is the usual
  images: {
    qualities: [75, 90],
    // photos added from the dashboard live in Supabase storage
    remotePatterns: [{ protocol: "https", hostname: "uzqkhnjgprpaygknxrch.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
};

export default nextConfig;
