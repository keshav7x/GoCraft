/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // The API (Fastify + tRPC) has no CORS setup, and the session cookie it
    // sets must stay first-party. Proxy /api/trpc/* to the API server-side so
    // browser requests stay same-origin with the Next.js app.
    const apiUrl = process.env.API_URL || "http://localhost:5000";
    return [
      {
        source: "/api/trpc/:path*",
        destination: `${apiUrl}/trpc/:path*`,
      },
    ];
  },
};

export default nextConfig;
