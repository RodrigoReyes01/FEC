import { NextResponse } from 'next/server'
import { getAdminContract } from '@/lib/adminWallet'
import { ethers } from 'ethers'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address || !ethers.isAddress(address)) {
        return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
    }

    try {
        const contract = getAdminContract()

        const [balance, isExempt, lastActivity, timeUntilPenalty] = await Promise.all([
            contract.balanceOf(address),
            contract.exemptFromPenalty(address),
            contract.lastActivity(address),
            contract.getTimeUntilPenalty(address)
        ])

        return NextResponse.json({
            address,
            balance: ethers.formatEther(balance),
            isExempt,
            lastActivity: new Date(Number(lastActivity) * 1000).toLocaleString(),
            timeUntilPenalty: (Number(timeUntilPenalty) / 86400).toFixed(2)
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
