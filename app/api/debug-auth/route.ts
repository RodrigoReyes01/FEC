import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const cookieStore = cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    const debugInfo: any = {
        userFound: !!user,
        userId: user?.id,
        userError: userError?.message,
        env: {
            url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
    }

    if (user) {
        // Check with Service Role
        try {
            const supabaseAdmin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            )

            const { data: profile, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            debugInfo.profileCheck = {
                success: !!profile,
                role: profile?.role,
                error: profileError?.message,
                fullProfile: profile
            }
        } catch (err: any) {
            debugInfo.profileCheck = {
                error: err.message
            }
        }
    }

    return NextResponse.json(debugInfo)
}
