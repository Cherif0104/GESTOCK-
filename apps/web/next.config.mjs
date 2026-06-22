/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@gestock/shared'],
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
