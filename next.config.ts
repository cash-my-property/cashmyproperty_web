import type { NextConfig } from "next";

// Har page pe security headers. Poori CSP (script-src) jaan bujh kar nahi — Firebase, Google sign-in,
// Maps, Vercel analytics ke saath pehle staging pe report-only test chahiye. Yeh wale kuch nahi todte.
const securityHeaders = [
  // Koi doosri site hamara page iframe mein na daal sake (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Site camera/mic/location use nahi karti (share + clipboard default allowed rehte hain)
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  // Sirf HTTPS (localhost http pe browser ise ignore karta hai)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
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
      { source: "/:path*", headers: securityHeaders },
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
