/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Punycode deprecation uyarısını gidermek için webpack konfigürasyonu
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Punycode ve ilgili modülleri fallback olarak devre dışı bırak
      config.resolve.fallback = {
        ...config.resolve.fallback,
        punycode: false,
        tr46: false,
        "whatwg-url": false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
      };

      // Punycode uyarısını bastırmak için
      config.ignoreWarnings = [{ module: /node_modules\/punycode/ }, { message: /The 'punycode' module is deprecated/ }];
    }
    return config;
  },
};

module.exports = withNextIntl(nextConfig);
