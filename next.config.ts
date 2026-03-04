import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  /**
   * Explicitly include the catalog rules file in the /api/agent serverless
   * function bundle.
   *
   * Why: src/server/prompts/base.ts reads the file at runtime via
   * fs.readFileSync(process.cwd() + '/src/a2ui/common_origin_catalog_rules.txt').
   * Next.js output file tracing is static — it doesn't follow dynamic
   * runtime paths — so the .txt file won't be bundled automatically.
   * Without this, the Vercel serverless function throws ENOENT on cold start.
   */
  outputFileTracingIncludes: {
    '/api/agent': ['./src/a2ui/common_origin_catalog_rules.txt'],
  },
};

export default nextConfig;
