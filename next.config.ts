import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    // Hardcode the presentation URL directly to bypass Vercel environment variable parsing
    const backendUrl = "https://dicing-saxophone-food.ngrok-free.dev";
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
