import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_GATEWAY_URL || "http://localhost:5002";
    return [
      {
        source: '/api/hrms/:path*',
        destination: `${backendUrl}/api/hrms/:path*`,
      },
      {
        source: '/api/erp-auth/:path*',
        destination: `${backendUrl}/api/erp-auth/:path*`,
      },
      {
        source: '/api/admin/digital201/:path*',
        destination: `${backendUrl}/api/admin/digital201/:path*`,
      },
    ];
  },
};

export default nextConfig;
