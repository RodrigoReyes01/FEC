import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ethers } from 'ethers'
import { getAdminWallet, getAdminContract } from '@/lib/adminWallet'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_PRAXEUM = 300

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, amountTokens } = body

        console.log('🛒 [BUY] Iniciando compra:', { userId, amountTokens })

        if (!userId || !amountTokens) {
            return NextResponse.json({ 
                error: 'Faltan parámetros: userId, amountTokens' 
            }, { status: 400 })
        }

        const amount = parseFloat(amountTokens)
        
        if (amount <= 0) {
            return NextResponse.json({ 
                error: 'Cantidad inválida' 
            }, { status: 400 })
        }

        if (amount > MAX_PRAXEUM) {
            return NextResponse.json({ 
                error: `Límite máximo de ${MAX_PRAXEUM} tokens por compra` 
            }, { status: 400 })
        }

        // Obtener perfil del usuario
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', userId)
            .single()

        if (profileError || !profile) {
            console.error('❌ [BUY] Error obteniendo perfil:', profileError)
            return NextResponse.json({ 
                error: 'Usuario no encontrado' 
            }, { status: 404 })
        }

        // Obtener wallet del usuario desde tabla wallets
        const { data: wallet, error: walletError } = await supabase
            .from('wallets')
            .select('address')
            .eq('user_id', userId)
            .single()

        if (walletError || !wallet) {
            console.error('❌ [BUY] Usuario sin billetera:', walletError)
            return NextResponse.json({ 
                error: 'Usuario no tiene billetera creada' 
            }, { status: 404 })
        }

        const walletAddress = wallet.address

        console.log('👤 [BUY] Usuario encontrado:', {
            name: `${profile.first_name} ${profile.last_name}`,
            wallet: walletAddress
        })

        // Obtener contrato y admin wallet
        const contract = await getAdminContract()
        const adminWallet = await getAdminWallet()
        const treasuryAddress = await contract.treasury()
        const decimals = await contract.decimals()
        const amountWei = ethers.parseUnits(amountTokens, decimals)

        console.log('💰 [BUY] Info del contrato:', {
            treasury: treasuryAddress,
            adminWallet: adminWallet.address,
            userWallet: walletAddress,
            decimals: Number(decimals),
            amountWei: amountWei.toString()
        })

        // Verificar balance del admin wallet (quien va a transferir)
        const adminBalance = await contract.balanceOf(adminWallet.address)
        console.log('💵 [BUY] Balance admin wallet:', ethers.formatUnits(adminBalance, decimals))
        // No verificamos tesorería para ahorrar llamadas RPC

        if (adminBalance < amountWei) {
            console.error('❌ [BUY] Balance insuficiente en admin wallet')
            console.error(`💡 Solución: El admin debe tener tokens. Mintea ${ethers.formatUnits(amountWei, decimals)} tokens a ${adminWallet.address} desde /admin/mint`)
            return NextResponse.json({ 
                error: `Balance insuficiente. El sistema necesita ${ethers.formatUnits(amountWei, decimals)} tokens. Contacta al administrador.` 
            }, { status: 400 })
        }

        // Transferir desde admin wallet al usuario (NO mintear)
        const contractWithSigner = contract.connect(adminWallet) as any
        
        console.log('📤 [BUY] Transfiriendo tokens desde admin wallet al usuario...')
        const tx = await contractWithSigner.transfer(walletAddress, amountWei)
        console.log('⏳ [BUY] Transacción enviada, hash:', tx.hash)
        
        const receipt = await tx.wait()
        console.log('✅ [BUY] Transacción confirmada en bloque:', receipt?.blockNumber)

        // Registrar transacción en DB
        await supabase.from('transactions').insert({
            from_wallet: adminWallet.address,
            to_wallet: walletAddress,
            amount: amountTokens,
            tx_hash: tx.hash
        })

        console.log('💾 [BUY] Transacción guardada en DB')

        return NextResponse.json({
            success: true,
            txHash: tx.hash,
            amount: amountTokens,
            from: adminWallet.address,
            to: walletAddress,
            toName: `${profile.first_name} ${profile.last_name}`,
            blockNumber: receipt?.blockNumber
        })
    } catch (error: any) {
        console.error('❌ [BUY] Error completo:', error)
        console.error('Stack trace:', error.stack)
        return NextResponse.json({ 
            error: error.message || 'Error al procesar la compra',
            details: error.reason || error.code || 'Unknown error'
        }, { status: 500 })
    }
}
