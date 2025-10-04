import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMIN_PATH = '/admin';
function hashAdminKey(k: string) {
  return crypto.createHash('sha256').update(k).digest('hex');
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Solo le pagine /admin sono protette (escluso /admin/login)
  if (pathname.startsWith(ADMIN_PATH) && pathname !== `${ADMIN_PATH}/login`) {
    const token = req.cookies.get('admin_token')?.value || '';
    const adminKey = process.env.ADMIN_KEY || '';
    const expected = adminKey ? hashAdminKey(adminKey) : '';
    if (!token || !expected || token !== expected) {
      const url = req.nextUrl.clone();
      url.pathname = `${ADMIN_PATH}/login`;
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

// Applica il middleware a tutto ma è “no-op” tranne /admin*
export const config = {
  matcher: ['/admin/:path*'],
};
