const nextConfig = {
  output: "standalone",
  outputFileTracingExcludes: {
    "/*": [
      "./.local-data/**/*",
      "./.test-pg/**/*",
      "./reference-demo/**/*",
      "./evidence/**/*",
      "./.next-provider-test/**/*",
      "./.tools/**/*",
      "./deliverables/**/*",
      "./.impeccable/**/*",
      "./.tmp/**/*",
    ],
  },
  distDir:
    process.env.NODE_ENV === "development"
      ? process.env.CPS_DEV_PROFILE === "provider-test"
        ? ".next-provider-test"
        : ".next-dev"
      : ".next",
  experimental: { cpus: 1 },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      ...[
        "/request",
        "/find-your-part",
        "/suppliers/register",
        "/supplier-registration",
        "/api/vendors",
        "/staff/:path*",
        "/api/staff/:path*",
        "/workspace/:path*",
        "/api/workspace/:path*",
        "/customer-access/:path*",
        "/auth/:path*",
      ].map((source) => ({
        source,
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      })),
    ];
  },
};
export default nextConfig;
