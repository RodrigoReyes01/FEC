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
        const { address, exempt } = await request.json()
        const contract = getAdminContract()
        const tx = await contract.setExemptFromPenalty(address, exempt)
        await tx.wait()
        return NextResponse.json({ success: true, txHash: tx.hash })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
