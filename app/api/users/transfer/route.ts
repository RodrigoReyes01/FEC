import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ethers } from 'ethers'
import { getAdminWallet, getAdminContract } from '@/lib/adminWallet'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { fromAddress, toCarnet, amount } = body

        if (!fromAddress || !toCarnet || !amount) {
            return NextResponse.json({ 
                error: 'Faltan parámetros: fromAddress, toCarnet, amount' 
            }, { status: 400 })
        }

        // Buscar destinatario por carnet
        const { data: toProfile, error: profileError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .eq('university_id', toCarnet)
            .single()

        if (profileError || !toProfile) {
            return NextResponse.json({ 
                error: 'Destinatario no encontrado' 
            }, { status: 404 })
        }

        // Obtener wallet del destinatario
        const { data: toWallet } = await supabase
            .from('wallets')
            .select('address')
            .eq('user_id', toProfile.id)
            .single()

        if (!toWallet) {
            return NextResponse.json({ 
                error: 'Destinatario no tiene billetera creada' 
            }, { status: 404 })
        }

        const toAddress = toWallet.address

        // Validar que no sea la misma dirección
        if (fromAddress.toLowerCase() === toAddress.toLowerCase()) {
            return NextResponse.json({ 
                error: 'No puedes enviarte tokens a ti mismo' 
            }, { status: 400 })
        }

        console.log('💸 [TRANSFER] Iniciando transferencia entre usuarios')
        console.log('💸 [TRANSFER] De:', fromAddress)
        console.log('💸 [TRANSFER] Para:', toAddress, `(${toProfile.first_name} ${toProfile.last_name})`)
        console.log('💸 [TRANSFER] Cantidad:', amount)

        // Obtener el contrato y admin wallet (para provider con ETH)
        const contract = await getAdminContract()
        const adminWallet = await getAdminWallet()
        const decimals = await contract.decimals()
        const amountWei = ethers.parseUnits(amount, decimals)

        // Verificar balance del remitente
        const balance = await contract.balanceOf(fromAddress)
        console.log('💸 [TRANSFER] Balance remitente:', ethers.formatUnits(balance, decimals))
        
        if (balance < amountWei) {
            return NextResponse.json({ 
                error: 'Balance insuficiente' 
            }, { status: 400 })
        }

        // Obtener private key del usuario remitente
        const { data: walletData } = await supabase
            .from('wallets')
            .select('private_key')
            .eq('address', fromAddress)
            .single()

        if (!walletData || !walletData.private_key) {
            return NextResponse.json({ 
                error: 'No se encontró la clave privada del usuario' 
            }, { status: 404 })
        }

        console.log('💸 [TRANSFER] Usuario firma y paga gas (tiene ETH del admin)')
        
        // Usuario firma y paga gas (tiene ETH que le dio el admin al crear cuenta)
        const userWallet = new ethers.Wallet(walletData.private_key, adminWallet.provider)
        const userContract = contract.connect(userWallet) as any
        
        // Ejecutar transferencia
        const tx = await userContract.transfer(toAddress, amountWei)
        console.log('💸 [TRANSFER] TX hash:', tx.hash)
        
        const receipt = await tx.wait()
        console.log('💸 [TRANSFER] Confirmada en bloque:', receipt?.blockNumber)

        // Registrar transacción en DB
        await supabase.from('transactions').insert({
            from_wallet: fromAddress,
            to_wallet: toAddress,
            amount: amount,
            tx_hash: tx.hash
        })

        return NextResponse.json({
            success: true,
            txHash: tx.hash,
            from: fromAddress,
            to: toAddress,
            toName: `${toProfile.first_name} ${toProfile.last_name}`,
            amount
        })
    } catch (error: any) {
        console.error('Transfer error:', error)
        
        // Error específico de falta de gas
        if (error.code === 'INSUFFICIENT_FUNDS') {
            return NextResponse.json({ 
                error: 'Necesitas Sepolia ETH para pagar el gas de la transacción. Contacta al administrador para obtener fondos.' 
            }, { status: 400 })
        }
        
        return NextResponse.json({ 
            error: error.message || 'Error al transferir tokens' 
        }, { status: 500 })
    }
}
