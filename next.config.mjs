/** @type {import('next').NextConfig} */
const nextConfig = {
  // The game is entirely client-side and deploys as static files, exactly as it did before.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: false,
};

export default nextConfig;
