import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  serverExternalPackages: ["nodemailer"],
  experimental: {
    optimizePackageImports: ["@astryxdesign/core", "@heroicons/react"],
  },
  // Serwist injects a webpack plugin; production builds use `next build --webpack`.
  turbopack: {},
};

export default withSerwist(nextConfig);
