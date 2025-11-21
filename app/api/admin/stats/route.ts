import { NextResponse } from 'next/server'
import { getAdminContract, getAdminWallet } from '@/lib/adminWallet'
import { ethers } from 'ethers'

// Configuración para Vercel - desactivar caché
export const dynamic = 'force-dynamic'
export const revalidate = 0

let CACHE: { data: any; ts: number } | null = null
const TTL_MS = 5 * 60 * 1000 // 5 minutes

async function withRetry<T>(fn: () => Promise<T>, retries = 3, baseDelay = 300) {
    let attempt = 0
    let lastErr: any
    while (attempt < retries) {
        try {
            return await fn()
        } catch (e) {
            lastErr = e
            const delay = baseDelay * Math.pow(2, attempt)
            await new Promise((res) => setTimeout(res, delay))
            attempt++
        }
    }
    throw lastErr
}

export async function GET() {
    try {
        if (CACHE && Date.now() - CACHE.ts < TTL_MS) {
            return NextResponse.json(CACHE.data, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            })
        }
        const contract = getAdminContract()

        const [decimals, totalSupply, treasury, inactivityPeriod, penaltyRate] = await withRetry(async () => Promise.all([
            contract.decimals(),
            contract.totalSupply(),
            contract.treasury(),
            contract.INACTIVITY_PERIOD(),
            contract.PENALTY_RATE()
        ]))

        try {
            console.log('[admin/stats] contract', String((contract as any).target))
            console.log('[admin/stats] decimals', Number(decimals))
            console.log('[admin/stats] totalSupply raw', totalSupply?.toString?.() ?? String(totalSupply))
            console.log('[admin/stats] treasury', treasury)

            const treasuryBalance = await contract.balanceOf(treasury)
            console.log('[admin/stats] treasuryBalance raw', treasuryBalance.toString())
            console.log('[admin/stats] inactivityPeriod (secs)', Number(inactivityPeriod))
            console.log('[admin/stats] penaltyRate', Number(penaltyRate))

            // Obtener balance de Sepolia ETH del admin wallet
            const adminWallet = await getAdminWallet()
            const adminEthBalance = await adminWallet.provider.getBalance(adminWallet.address)
            console.log('[admin/stats] admin ETH balance', ethers.formatEther(adminEthBalance))
        } catch { }

        const dec = Number(decimals)

        // Obtener balance de ETH del admin wallet
        const adminWallet = await getAdminWallet()
        const adminEthBalance = await adminWallet.provider.getBalance(adminWallet.address)

        const data = {
            totalSupply: ethers.formatUnits(totalSupply, dec),
            treasuryBalance: ethers.formatUnits(await contract.balanceOf(treasury), dec),
            inactivityPeriod: (Number(inactivityPeriod) / 86400).toFixed(1),
            penaltyRate: Number(penaltyRate).toString(),
            adminEthBalance: ethers.formatEther(adminEthBalance),
            adminWalletAddress: adminWallet.address,
            decimals: dec
        }
        CACHE = { data, ts: Date.now() }
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
