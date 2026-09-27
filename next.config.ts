import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "*": ["data/business-facts.md"],
  }
};

export default nextConfig;
