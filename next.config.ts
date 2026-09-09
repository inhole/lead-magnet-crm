import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  outputFileTracingIncludes: {
    "/api/swagger-assets/*": ["./node_modules/swagger-ui-dist/swagger-ui.css", "./node_modules/swagger-ui-dist/swagger-ui-bundle.js"],
  },
};

export default nextConfig;
