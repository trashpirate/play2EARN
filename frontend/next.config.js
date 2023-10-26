/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  images: {
    domains: [
      "bafybeia6bsfqa4zugsyx4b35x6gueg6h4ljlq5s66oazg7yxqx3oyujs6u.ipfs.nftstorage.link",
    ],
  },
};

module.exports = nextConfig
