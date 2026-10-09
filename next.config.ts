import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.GITHUB_PAGES === "true"
    ? {
        output: "export" as const,
        basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
