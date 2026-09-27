/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ESLint isn't part of this MVP's toolchain; TypeScript still type-checks every build.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
