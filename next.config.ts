import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "mediaoffice.ae",
      },
      // Google sign-in avatars (avatarUrl = Google profile picture)
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      // NOTE: "**" wildcard jaan bujh kar hataya gaya hai — usse /_next/image kisi bhi
      // domain ki image proxy/optimize kar deta tha (bandwidth/cost abuse). Naya image
      // host aaye to yahan explicitly add karein.
    ],
  },
  // My Offers / My Contracts ab CMP Connect RTO API pe hain (/me/offers, /me/contracts).
  // Single contract ki alag API nahi — contract ka status/dobara upload offer page pe hota hai.
  async redirects() {
    return [
      { source: "/:locale(en|ar)/dashboard/contracts/:id", destination: "/:locale/dashboard/contracts", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
      {
        source: "/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
      {
        source: "/:locale(en|ar)/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
      {
        source: "/:locale(en|ar)/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
      {
        source: "/assetlinks.json",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
      {
        source: "/:locale(en|ar)/.well-known/assetlinks.json",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
      {
        source: "/:locale(en|ar)/assetlinks.json",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
  onDemandEntries: {
  maxInactiveAge: 25 * 1000, // 25 seconds baad inactive page memory se clear
  pagesBufferLength: 2,      // Sirf 2 active pages RAM mein rahenge
},

};

export default nextConfig;
