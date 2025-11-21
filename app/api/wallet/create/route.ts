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
        // Nota: balance se obtiene del blockchain, no se guarda en DB
        const { data: newWallet, error: walletError } = await supabase
            .from('wallets')
            .insert({
                user_id: user.id,
                address: wallet.address,
                private_key: wallet.privateKey
            })
            .select()
            .single()

        if (walletError) {
            console.error('Error creating wallet:', walletError)
            return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 })
        }

        // Enviar Sepolia ETH al nuevo usuario para gas
        try {
            const { getAdminWallet } = await import('@/lib/adminWallet')
            const adminWallet = await getAdminWallet()
            
            // Enviar 0.002 ETH (suficiente para ~20 transacciones)
            const ethAmount = ethers.parseEther('0.002')
            
            console.log('💰 [WALLET] Enviando Sepolia ETH al nuevo usuario...')
            console.log('💰 [WALLET] Cantidad:', ethers.formatEther(ethAmount), 'ETH')
            console.log('💰 [WALLET] Destinatario:', wallet.address)
            
            const tx = await adminWallet.sendTransaction({
                to: wallet.address,
                value: ethAmount
            })
            
            console.log('💰 [WALLET] TX hash:', tx.hash)
            await tx.wait()
            console.log('✅ [WALLET] Sepolia ETH enviado exitosamente')
        } catch (ethError: any) {
            console.error('⚠️ [WALLET] Error enviando ETH (no crítico):', ethError.message)
            // No fallar la creación de wallet si falla el envío de ETH
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
