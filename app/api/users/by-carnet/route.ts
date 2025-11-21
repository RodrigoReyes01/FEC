import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const carnet = searchParams.get('carnet')

        if (!carnet) {
            return NextResponse.json({ error: 'Carnet requerido' }, { status: 400 })
        }

        // Buscar perfil por university_id
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, university_id, first_name, last_name')
            .eq('university_id', carnet)
            .single()

        if (error || !profile) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        // Obtener wallet desde tabla wallets
        const { data: wallet } = await supabase
            .from('wallets')
            .select('address')
            .eq('user_id', profile.id)
            .single()

        return NextResponse.json({
            id: profile.id,
            carnet: profile.university_id,
            firstName: profile.first_name,
            lastName: profile.last_name,
            walletAddress: wallet?.address || null
        })
    } catch (error: any) {
        console.error('Error fetching user by carnet:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
