import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/loans",
        destination: "/hrms/loans",
        permanent: false,
      },
      {
        source: "/loan",
        destination: "/hrms/loans",
        permanent: false,
      },
      {
        source: "/letters",
        destination: "/hrms/letters",
        permanent: false,
      },
      {
        source: "/letter",
        destination: "/hrms/letters",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
