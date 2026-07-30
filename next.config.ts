/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  // Next picks the next free port (3001, 3002...) whenever 3000 is taken,
  // so each dev origin is listed for a few fallback ports too.
  allowedDevOrigins: [
    "localhost:3000",
    "localhost:3001",
    "localhost:3002",
    "192.168.100.9:3000",
    "192.168.100.9:3001",
    "192.168.100.9:3002",
    "addictstyle.com:3000",
    "addictstyle.com:3001",
    "addictstyle.com:3002",
    "askmebeauty.com:3000",
    "askmebeauty.com:3001",
    "askmebeauty.com:3002",
    "digitfriend.com:3000",
    "digitfriend.com:3001",
    "digitfriend.com:3002",
    "living.com:3000",
    "living.com:3001",
    "living.com:3002",
    "outdoor.com:3000",
    "outdoor.com:3001",
    "outdoor.com:3002",
  ],
};

export default nextConfig;
