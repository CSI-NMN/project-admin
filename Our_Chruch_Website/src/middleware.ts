import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  // Do not protect the login route itself
  if (pathname === '/login') {
    if (token) {
      // If already logged in, redirect away from login page
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Protect all other routes except API and static files
  // (Next.js middleware matcher usually handles static file filtering, but we'll do it purely via matcher)
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Protect all routes except /api, /_next/static, /_next/image, and favicon.ico
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}