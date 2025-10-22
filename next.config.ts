const nextConfig = {
  // Оптимізації продуктивності
  swcMinify: true,
  poweredByHeader: false,
  compress: true,

  // Експериментальні налаштування для кращої продуктивності
  experimental: {
    optimizeCss: true,
    gzipSize: true,
  },

  // Webpack оптимізації
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpack: (config: any, { dev, isServer }: any) => {
    // Оптимізації для production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: -10,
            chunks: "all",
          },
        },
      };
    }
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "openweathermap.org",
        pathname: "/img/wn/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  outputFileTracingRoot: __dirname,

  // Відключення попереджень про preload в development
  eslint: {
    ignoreDuringBuilds: false,
  },

  async headers() {
    return [
      {
        source: "/api/cities",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
