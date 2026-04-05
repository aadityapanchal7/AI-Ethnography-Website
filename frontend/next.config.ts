import type { NextConfig } from "next";
import path from "path";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  turbopack: {
    root: path.join(__dirname),
  },

  transpilePackages: ["three", "react-globe.gl"],
};

export default withPWA(nextConfig);
