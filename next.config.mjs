/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
  // Proxy API calls through the frontend's own domain instead of the browser
  // calling the backend's domain directly. The backend and frontend are
  // deployed as two separate Vercel projects on two different domains, so a
  // login cookie set by a direct cross-domain call is invisible to
  // middleware.js (which only ever sees cookies scoped to this domain). This
  // rewrite makes every /api/* call same-origin from the browser's point of
  // view - Vercel forwards it server-side to the real backend - so the
  // login cookie ends up scoped to this domain and middleware.js can see it.
  async rewrites() {
    const backendOrigin = process.env.BACKEND_ORIGIN || 'http://localhost:5000';
    return [
      { source: '/api/:path*', destination: `${backendOrigin}/api/:path*` },
    ];
  },
};

export default nextConfig;
