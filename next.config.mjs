/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Next 16 defaults `qualities` to [75] and coerces anything else to the
    // nearest allowed value, so the 82 the editorial images ask for would be
    // silently dropped to 75. Declared here so the intent actually takes.
    qualities: [82],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920, 2400],
    imageSizes: [96, 160, 240, 320, 480, 640],
  },
};

export default nextConfig;
