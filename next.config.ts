import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // Hostify CDN — listing photos
      { protocol: "https", hostname: "img.hostify.com" },
      { protocol: "https", hostname: "static.hostify.com" },
      { protocol: "https", hostname: "go-static.hostify.com" },
      // Picsum — placeholder fallbacks (mock data + brand imagery)
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
};

export default withNextIntl(nextConfig);
