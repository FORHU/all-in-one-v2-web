/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // CJ Dropshipping serves product/variant images off several
      // subdomains (cf.cjdropshipping.com, oss-cf.cjdropshipping.com seen
      // so far) — wildcarded so newly imported products don't need a
      // config change per subdomain.
      {
        protocol: "https",
        hostname: "*.cjdropshipping.com",
      },
      // The platform's own S3 bucket, used to re-host CJ product/collection
      // images during import rather than hotlinking CJ's CDN directly (see
      // product-import.service.ts). Bucket name is per-environment — this
      // is the dev bucket; staging/prod will need their own hostname added
      // here when those buckets are known.
      {
        protocol: "https",
        hostname: "forhu-marketplace-dev.s3.ap-southeast-1.amazonaws.com",
      },
    ],
  },
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
