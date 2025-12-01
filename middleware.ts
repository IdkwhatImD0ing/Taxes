import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const AUTH_COOKIE_NAME = 'auth_token'

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/bill']

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.AUTH_SECRET
    if (!secret) return false
    const secretKey = new TextEncoder().encode(secret)
    await jwtVerify(token, secretKey)
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  
  if (!token || !(await verifyToken(token))) {
    // Redirect to login if not authenticated
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
