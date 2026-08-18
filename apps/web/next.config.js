// Set only by `npm run build:desktop` (the Tauri build pipeline) — the
// regular Vercel deploy never sets BUILD_TARGET, so `next build` there is
// unaffected by anything gated on this.
const isDesktopExport = process.env.BUILD_TARGET === 'desktop';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isDesktopExport ? { output: 'export', images: { unoptimized: true } } : {}),
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      bufferutil: 'commonjs bufferutil',
    });
    return config;
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_BILLING_ENFORCED: process.env.BILLING_ENFORCED || 'false',
    // Lets a handful of marketing/legal pages skip reading `searchParams` (CMS
    // preview mode, meaningless in the installed desktop app anyway) so they
    // stay statically exportable instead of forcing a dynamic-render bailout.
    NEXT_PUBLIC_BUILD_TARGET: isDesktopExport ? 'desktop' : 'web',
  },
};

export default nextConfig;
