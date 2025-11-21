import { NextRequest, NextResponse } from 'next/server'
import { getAdminContract } from '@/lib/adminWallet'
import { ethers } from 'ethers'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const address = searchParams.get('address')

        if (!address) {
            return NextResponse.json({ error: 'Dirección requerida' }, { status: 400 })
        }

        const contract = await getAdminContract()
        
        // Obtener balance y decimales
        const [balance, decimals] = await Promise.all([
            contract.balanceOf(address),
            contract.decimals()
        ])

        const formattedBalance = ethers.formatUnits(balance, decimals)

        return NextResponse.json({
            address,
            balance: formattedBalance,
            balanceRaw: balance.toString(),
            decimals: Number(decimals)
        })
    } catch (error: any) {
        console.error('Error fetching balance:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
