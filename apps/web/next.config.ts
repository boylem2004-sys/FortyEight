import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript source. Next compiles them.
  transpilePackages: ["@fortyeight/core", "@fortyeight/api-client", "@fortyeight/db"],
  poweredByHeader: false,
};

export default nextConfig;
