import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_HINT_COOKIE } from '@/lib/authHint'
import { features } from '@/config/features'

const locales = ['en', 'ar']
const defaultLocale = 'en'

function getLocale(request: NextRequest) {
  // Check if there is a locale cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale
  }
  
  // Otherwise default to en
  return defaultLocale
}

// Protected sections: hint cookie na ho to server pe hi login pe bhej do (dashboard shell flash nahi hoga).
// Yeh optimistic check hai — asli authorization backend API karta hai (dekho src/lib/authHint.ts).
const PROTECTED_PATH = /^\/(en|ar)\/dashboard(\/|$)/

// Real Time Offers OFF (src/config/features.ts) → in routes pe koi na pahunche (purane links, notifications, bookmarks bhi)
const RTO_PUBLIC_PATH = /^\/(en|ar)\/(auctions|property|public-property)(\/|$)/
const RTO_DASHBOARD_PATH = /^\/(en|ar)\/dashboard\/(bids|contracts)(\/|$)/

// Next.js 16: `middleware` convention ab `proxy` kehlata hai
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Completely bypass locale redirects for .well-known, apple, and android association files
  if (
    pathname.includes('.well-known') ||
    pathname.includes('apple-app-site-association') ||
    pathname.includes('assetlinks.json')
  ) {
    if (
      pathname.startsWith('/en/.well-known') ||
      pathname.startsWith('/ar/.well-known') ||
      pathname.startsWith('/en/apple-app-site-association') ||
      pathname.startsWith('/ar/apple-app-site-association') ||
      pathname.startsWith('/en/assetlinks.json') ||
      pathname.startsWith('/ar/assetlinks.json')
    ) {
      const targetPath = pathname.replace(/^\/(en|ar)/, '');
      return NextResponse.rewrite(new URL(targetPath, request.url));
    }
    return NextResponse.next();
  }

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
 
  if (pathnameHasLocale) {
    if (!features.realTimeOffers) {
      const pub = pathname.match(RTO_PUBLIC_PATH)
      if (pub) return NextResponse.redirect(new URL(`/${pub[1]}/listings`, request.url))
      const dash = pathname.match(RTO_DASHBOARD_PATH)
      if (dash) return NextResponse.redirect(new URL(`/${dash[1]}/dashboard`, request.url))
    }
    const protectedMatch = pathname.match(PROTECTED_PATH)
    if (protectedMatch && !request.cookies.has(AUTH_HINT_COOKIE)) {
      const loginUrl = new URL(`/${protectedMatch[1]}/login`, request.url)
      loginUrl.searchParams.set('next', pathname + request.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }
 
  // Redirect if there is no locale
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`
  
  const response = NextResponse.redirect(request.nextUrl)
  
  // Set the cookie for future requests
  response.cookies.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
  
  return response
}
 
export const config = {
  matcher: [
    // Skip all internal paths (_next), service worker, well-known, SEO files (sitemap/robots — warna /en/sitemap.xml pe redirect hokar 404), and static files
    '/((?!_next|images|favicon.ico|sitemap\\.xml|robots\\.txt|firebase-messaging-sw.js|\\.well-known|apple-app-site-association|assetlinks\\.json|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp|.*\\.ico|.*\\.pdf|api).*)',
  ],
}
