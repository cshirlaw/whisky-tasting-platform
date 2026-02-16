/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      "/reviewers": ["./data/reviewers/**/*.json", "./data/tastings/**/*.json"],
      "/reviewers/[id]": ["./data/reviewers/**/*.json", "./data/tastings/**/*.json"],
      "/api/reviewers": ["./data/reviewers/**/*.json"],
      "/api/bottles": ["./data/bottles/**/*.json", "./data/tastings/**/*.json"],
      "/api/tastings": ["./data/tastings/**/*.json"],
      "/bottles": ["./data/bottles/**/*.json", "./data/tastings/**/*.json"],
      "/bottles/[slug]": ["./data/bottles/**/*.json", "./data/tastings/**/*.json"],
      "/tastings": ["./data/tastings/**/*.json"],
      "/tastings/[slug]": ["./data/tastings/**/*.json"]
    }
  }
};

module.exports = nextConfig;
