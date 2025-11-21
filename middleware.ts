import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes logic
    if (request.nextUrl.pathname.startsWith('/admin')) {
        console.log('Middleware: Checking admin access for', request.nextUrl.pathname)

        if (!user) {
            console.log('Middleware: No user found, redirecting to login')
            return NextResponse.redirect(new URL('/login', request.url))
        }

        console.log('Middleware: User found:', user.id)

        // Check if user is admin using Service Role Key to bypass RLS
        try {
            const { createClient } = await import('@supabase/supabase-js')

            if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                console.error('Middleware: SUPABASE_SERVICE_ROLE_KEY is missing')
                return NextResponse.redirect(new URL('/', request.url))
            }

            const supabaseAdmin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            )

            const { data: profile, error } = await supabaseAdmin
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            console.log('Middleware: Profile check result:', { role: profile?.role, error: error?.message })

            if (error || !profile || profile.role !== 'admin') {
                console.log('Middleware: Access denied. Redirecting to home.')
                return NextResponse.redirect(new URL('/', request.url))
            }

            console.log('Middleware: Access granted')
        } catch (err) {
            console.error('Middleware: Unexpected error:', err)
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/admin/:path*',
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
