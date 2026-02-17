import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/workspace(.*)', '/my-courses(.*)', '/account(.*)', '/admin(.*)', '/tenant-admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  const host = req.headers.get('host') || '';
  const appHost = process.env.NEXT_PUBLIC_APP_HOST || 'localhost:3000';

  if (host && host !== appHost && !host.startsWith('localhost') && host.split('.').length > 2) {
    const subdomain = host.split('.')[0];
    const url = req.nextUrl.clone();

    if (!url.pathname.startsWith('/t/')) {
      url.pathname = `/t/${subdomain}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/api/(.*)']
};
