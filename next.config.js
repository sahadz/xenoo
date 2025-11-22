/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
let supabaseHost = ''
try {
  if (supabaseUrl) supabaseHost = new URL(supabaseUrl).host
} catch (e) { supabaseHost = '' }

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['xenora.example', 'lh3.googleusercontent.com', 'images.unsplash.com', supabaseHost].filter(Boolean),
    formats: ['image/avif', 'image/webp'],
  },
}
module.exports = nextConfig
