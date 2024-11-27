import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const robotsTxt = `User-agent: *
Allow: /
Allow: /collection/*
Allow: /about
Allow: /sitemap.xml

Disallow: /admin/*
Disallow: /api/*
Disallow: /auth/*
Disallow: /dashboard/*
Disallow: /settings/*`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
} 