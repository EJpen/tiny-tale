/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    serverActions: {
      allowedDevOrigins: [process.env.CORS_ORIGINS || "http://localhost:3000"],
    },
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "_http_common"];
    }
    return config;
  },
};
