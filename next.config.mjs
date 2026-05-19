import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

const repo = 'docs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,

  images: {
    unoptimized: true,
  },

  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
};

export default withMDX(nextConfig);
