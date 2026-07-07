import { createServerClient } from '@supabase/ssr';
import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

const locales = ['tr', 'en'] as const;
const defaultLocale = 'tr';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

const PROTECTED = /^\/(tr|en)\/(dashboard|meetings|team|settings)/;
const AUTH_ONLY = /^\/(tr|en)\/(login|register)/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });
  let user: any = null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    try {
      // Always call getUser() — this refreshes the auth token if needed
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch (e) {
      console.warn('Supabase error in middleware:', e);
    }
  }

  // Bypass auth if demo_mode cookie is set
  if (request.cookies.get('demo_mode')?.value === 'true') {
    user = { id: 'demo-user', email: 'demo@meetmind.com' };
  }

  const localeMatch = pathname.match(/^\/(tr|en)/);
  const locale = localeMatch?.[1] ?? defaultLocale;

  if (PROTECTED.test(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  if (AUTH_ONLY.test(pathname) && user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  // API routes only need the auth cookie refresh, not locale routing
  if (pathname.startsWith('/api')) {
    return supabaseResponse;
  }

  // Run next-intl locale routing
  const intlResponse = intlMiddleware(request);

  // Forward refreshed auth cookies to the intl response
  supabaseResponse.cookies.getAll().forEach(({ name, value, ...rest }) => {
    intlResponse.cookies.set(name, value, rest);
  });

  return intlResponse;
}

export const config = {
  matcher: ['/((?!_next|_vercel|api|.*\\..*).*)', '/api/:path*'],
};
