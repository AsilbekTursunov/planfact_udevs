import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  sassOptions: {
    additionalData: `@use "${path.resolve(process.cwd(), 'styles/_variables.scss').replace(/\\/g, '/')}" as *;`,
  },
};

export default nextConfig;
