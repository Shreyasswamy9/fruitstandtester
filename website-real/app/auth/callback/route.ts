import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const DEFAULT_REDIRECT = '/account';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

type CookieConfig = {
  name: string;
  value: string;
  options?: {
    path?: string;
    domain?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none' | boolean;
    expires?: Date;
    maxAge?: number;
  };
};

const isSafeRedirect = (target: string | null) => {
  if (!target) return false;
  if (!target.startsWith('/')) return false;
  return !target.startsWith('//');
};

export async function GET(request: Request) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not configured.');
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const upstreamError = requestUrl.searchParams.get('error');
  const upstreamErrorDescription = requestUrl.searchParams.get('error_description');
  const redirectParam = requestUrl.searchParams.get('redirect');

  const redirectDestination = isSafeRedirect(redirectParam) ? redirectParam! : DEFAULT_REDIRECT;

  const cookieStore = await cookies();
  const stagedCookies: CookieConfig[] = [];

  let errorCode = upstreamError;
  let errorDescription = upstreamErrorDescription;

  if (code) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: async () => cookieStore.getAll(),
        setAll: async (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            stagedCookies.push({ name, value, options });
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      errorCode = 'auth_exchange_failed';
      errorDescription = error.message;
    }
  }

  const redirectUrl = new URL(redirectDestination, requestUrl.origin);

  if (errorCode) {
    redirectUrl.searchParams.set('error', errorCode);
    if (errorDescription) {
      redirectUrl.searchParams.set('error_description', errorDescription);
    }
  }

  const response = NextResponse.redirect(redirectUrl);

  stagedCookies.forEach(({ name, value, options }) => {
    response.cookies.set({ name, value, ...options });
  });

  return response;
}
