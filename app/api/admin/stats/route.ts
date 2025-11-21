import { NextResponse } from 'next/server'
import { getAdminContract } from '@/lib/adminWallet'
import { ethers } from 'ethers'

export async function GET() {
    try {
        const contract = getAdminContract()

        const [totalSupply, treasury, inactivityPeriod, penaltyRate] = await Promise.all([
            contract.totalSupply(),
            contract.treasury(),
            contract.INACTIVITY_PERIOD(),
            contract.PENALTY_RATE()
        ])

        const treasuryBalance = await contract.balanceOf(treasury)

        return NextResponse.json({
            totalSupply: ethers.formatEther(totalSupply),
            treasuryBalance: ethers.formatEther(treasuryBalance),
            inactivityPeriod: (Number(inactivityPeriod) / 86400).toFixed(1),
            penaltyRate: Number(penaltyRate).toString()
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
