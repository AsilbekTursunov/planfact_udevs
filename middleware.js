import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Allow login page
  if (pathname === '/pages/auth') {
    return NextResponse.next()
  }
  
  // Check authentication for all other pages
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true'

  if (!isAuthenticated && pathname !== '/pages/auth') {
    return NextResponse.redirect(new URL('/pages/auth', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
