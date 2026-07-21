/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  // Proxy API calls through the frontend's own domain instead of the browser
  // calling the backend's domain directly. The backend and frontend are
  // deployed as two separate Vercel projects on two different domains, so a
  // login cookie set by a direct cross-domain call is invisible to
  // middleware.js. This keeps /api/* same-origin from the browser's point of view.
  async rewrites() {
    const backendOrigin = process.env.BACKEND_ORIGIN || 'http://localhost:5000';
    return [
      { source: '/api/:path*', destination: `${backendOrigin}/api/:path*` },
    ];
  },
};

export default nextConfig;
