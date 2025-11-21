import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAdminContract } from '@/lib/adminWallet'
import { ethers } from 'ethers'

export async function POST(request: Request) {
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

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Role Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3. Execute Mint
    try {
        const body = await request.json()
        const { recipient, amount } = body

        if (!recipient || !amount) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
        }

        const contract = getAdminContract()
        const amountWei = ethers.parseEther(amount.toString())

        const tx = await contract.mint(recipient, amountWei)
        await tx.wait()

        return NextResponse.json({ success: true, txHash: tx.hash })
    } catch (error: any) {
        console.error('Mint error:', error)
        return NextResponse.json({ error: error.message || 'Mint failed' }, { status: 500 })
    }
}
