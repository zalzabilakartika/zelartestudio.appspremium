import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages deployment via @cloudflare/next-on-pages
  // See: https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/get-started/
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
