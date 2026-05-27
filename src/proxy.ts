import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const session = request.cookies.get('session');

  // Paths that don't require authentication
  const publicPaths = ['/login', '/api/auth/session', '/api/auth/logout'];
  
  const isPublicPath = publicPaths.some(p => request.nextUrl.pathname.startsWith(p));

  // If there's no session and the user is trying to access a protected route
  if (!session && !isPublicPath) {
    // Redirect them to the login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
