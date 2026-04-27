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

  // Build a Supabase client that refreshes session tokens via cookies
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Always call getUser() — this refreshes the auth token if needed
  const { data: { user } } = await supabase.auth.getUser();

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
