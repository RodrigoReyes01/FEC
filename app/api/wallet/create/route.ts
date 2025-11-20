import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        // Check if wallet already exists
        const { data: existingWallet } = await supabase
            .from('wallets')
            .select('address')
            .eq('user_id', user.id)
            .single()

        if (existingWallet) {
            return NextResponse.json({
                success: true,
                address: existingWallet.address,
                message: 'Wallet already exists'
            })
        }

        // Dynamically import ethers to avoid build issues
        const { ethers } = await import('ethers')

        // Generate new wallet
        const wallet = ethers.Wallet.createRandom()

        // Store wallet in database
        const { data: newWallet, error: walletError } = await supabase
            .from('wallets')
            .insert({
                user_id: user.id,
                address: wallet.address,
                private_key: wallet.privateKey,
                balance: 0
            })
            .select()
            .single()

        if (walletError) {
            console.error('Error creating wallet:', walletError)
            return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            address: wallet.address
        })

    } catch (error: any) {
        console.error('Error in wallet creation:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
