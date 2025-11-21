import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAdminContract } from '@/lib/adminWallet'

export async function POST(request: Request) {
    const cookieStore = cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    try {
        const { newTreasury } = await request.json()
        const contract = getAdminContract()
        const tx = await contract.setTreasury(newTreasury)
        await tx.wait()
        return NextResponse.json({ success: true, txHash: tx.hash })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET() {
    // Allow fetching treasury info without strict admin check if needed, but safer to keep it protected or public read
    // For now, let's protect it or just return public data
    try {
        const contract = getAdminContract()
        const treasury = await contract.treasury()
        return NextResponse.json({ treasury })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
