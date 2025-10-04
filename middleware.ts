import { NextRequest, NextResponse } from 'next/server';

// WebCrypto (Edge) — SHA-256 hex
async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

const ADMIN_BASE = '/admin';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Non proteggere la pagina di login
  if (!pathname.startsWith(ADMIN_BASE) || pathname === `${ADMIN_BASE}/login`) {
    return NextResponse.next();
  }

  const cookieToken = req.cookies.get('admin_token')?.value || '';
  const adminKey = process.env.ADMIN_KEY || '';

  // Se manca ADMIN_KEY evitiamo crash e mandiamo alla login
  if (!adminKey) {
    const url = req.nextUrl.clone();
    url.pathname = `${ADMIN_BASE}/login`;
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  const expected = await sha256Hex(adminKey);

  if (cookieToken !== expected) {
    const url = req.nextUrl.clone();
    url.pathname = `${ADMIN_BASE}/login`;
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
