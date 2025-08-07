import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/']
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Get user from localStorage (we'll check this on client side)
  // For server-side, we'll redirect and let client handle the auth check
  if (!isPublicRoute) {
    // For protected routes, we'll let the ProtectedRoute component handle the redirect
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}