import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.218.166.215', '192.168.159.1', '192.168.226.1'],
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
