/**
 * middleware.ts — Route protection & auth session refresh
 *
 * Runs on every matching request BEFORE the page renders:
 * 1. Refreshes the Supabase session (rotates tokens if needed)
 * 2. Protects /dashboard — unauthenticated users → /login
 * 3. Redirects authenticated users away from /login and /signup → /dashboard
 *
 * Uses getUser() (not getSession()) per Supabase security recommendations:
 * getSession() reads from the cookie without re-validating with the server,
 * so it can be spoofed. getUser() always hits the Supabase Auth server.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Create a Supabase client that can read/write cookies from the middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // First write to request (so subsequent middleware sees them)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Re-create response with the updated request
          supabaseResponse = NextResponse.next({ request })
          // Then write to response (so browser stores them)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Always call getUser() here — do not use getSession().
  // This validates the token with Supabase servers and cannot be spoofed.
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protect /dashboard — redirect unauthenticated users to /login
  if (pathname.startsWith('/dashboard') && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from /login and /signup
  if ((pathname === '/login' || pathname === '/signup') && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // Return supabaseResponse (not NextResponse.next()) so cookies are preserved
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
