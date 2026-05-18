/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Required for onnxruntime-web (WASM multi-threading via SharedArrayBuffer) ──
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy',   value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy',  value: 'credentialless' },
        ],
      },
    ];
  },

  // ── Exclude server-only onnx package from browser bundle ──
  turbopack: {},
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'onnxruntime-node$': false,
        'sharp$': false,
      };
    }
    // Allow WASM imports
    config.experiments = { ...config.experiments, asyncWebAssembly: true, layers: true };
    return config;
  },
};

export default nextConfig;
