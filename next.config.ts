import type { NextConfig } from "next";

const path = require('path');

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  turbopack: {
    root: path.join(__dirname), // points to ai-ethnography-website folder
  },

  // Use webpack instead of turbopack for compatibility with react-globe.gl
  // turbopack: false,

  // Transpile packages that need it
  transpilePackages: ["three", "react-globe.gl"],
};

module.exports = nextConfig;

export default withPWA(nextConfig);
