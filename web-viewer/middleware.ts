import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-host');
  const host =
    (forwarded?.split(',')[0]?.trim() || request.headers.get('host') || '').trim();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-host', host);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
