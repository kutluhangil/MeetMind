import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // Suppress ESLint during builds (no ESLint config in this project)
  eslint: { ignoreDuringBuilds: true },

  // Prevent build failure when server-only env vars are absent at build time
  // (they're provided by Vercel at runtime, not baked into the bundle)
  experimental: {
    serverComponentsExternalPackages: ['ioredis', 'bullmq'],
  },
};

export default withNextIntl(nextConfig);
