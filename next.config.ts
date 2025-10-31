
/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    serverActions: {
      allowedDevOrigins: [ process.env.CORS_ORIGINS || 'http://localhost:3000' ],
    },
  },
}