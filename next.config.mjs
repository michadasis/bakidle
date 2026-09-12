/** @type {import('next').NextConfig} */
const nextConfig = {
  // The game itself is client-side, but the solved counter needs an endpoint of its own, and a
  // static export cannot have one. Pages are still prerendered; only /api is served at runtime.
  images: { unoptimized: true },
  trailingSlash: false,
};

export default nextConfig;
