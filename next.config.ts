/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    "localhost:3000",
    "192.168.100.9:3000",
    "addictstyle.com:3000",
    "askmebeauty.com:3000",
    "digitfriend.com:3000",
    "living.com:3000",
    "outdoor.com:3000",
  ],
};

export default nextConfig;
