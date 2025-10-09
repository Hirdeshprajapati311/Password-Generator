import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  async redirects() {
        return [
      {
        source: "/",
        destination: "/vault",
        permanent: true, // or false if you might change later
      },
    ];
  },
};

export default nextConfig;
