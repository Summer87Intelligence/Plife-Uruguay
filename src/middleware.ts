import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { devAuthLog, isValidProfile, resolveSessionAndProfile } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const session = await resolveSessionAndProfile(supabase)
  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith('/login')
  const isAppPage = pathname.startsWith('/app')

  if (!session.user && isAppPage) {
    devAuthLog('middleware redirect', { from: pathname, to: '/login', reason: 'no_session' })
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session.user && isAppPage && !isValidProfile(session)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'missing_profile')
    devAuthLog('middleware redirect', {
      from: pathname,
      to: loginUrl.pathname + loginUrl.search,
      reason: session.missingProfile ? 'missing_profile' : 'inactive_profile',
    })
    return NextResponse.redirect(loginUrl)
  }

  if (session.user && isAuthPage && isValidProfile(session)) {
    devAuthLog('middleware redirect', { from: pathname, to: '/app/hoy', reason: 'valid_session' })
    return NextResponse.redirect(new URL('/app/hoy', request.url))
  }

  devAuthLog('middleware pass', {
    path: pathname,
    hasUser: !!session.user,
    hasProfile: !!session.profile,
    missingProfile: session.missingProfile,
    inactiveProfile: session.inactiveProfile,
  })

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
