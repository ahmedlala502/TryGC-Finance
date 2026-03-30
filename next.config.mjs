/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["sql.js"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb"
    }
  }
};

export default nextConfig;
