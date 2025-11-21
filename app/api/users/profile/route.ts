import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, university_id, first_name, last_name, role')
            .eq('id', userId)
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }

        // Obtener wallet desde tabla wallets
        const { data: wallet } = await supabase
            .from('wallets')
            .select('address')
            .eq('user_id', userId)
            .single()

        return NextResponse.json({
            id: profile.id,
            universityId: profile.university_id,
            firstName: profile.first_name,
            lastName: profile.last_name,
            walletAddress: wallet?.address || null,
            role: profile.role
        })
    } catch (error: any) {
        console.error('Error fetching profile:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
