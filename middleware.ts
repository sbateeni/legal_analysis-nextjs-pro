import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // التأكد من أن المسارات تعمل بشكل صحيح
  if (pathname === '/') {
    return NextResponse.next()
  }
  
  // معالجة API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // معالجة الصفحات الأخرى
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 