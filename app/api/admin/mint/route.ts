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

        console.log('[MINT] Request body:', { recipient, amount })

        if (!amount) {
            return NextResponse.json({ error: 'Missing amount' }, { status: 400 })
        }

        const contract = getAdminContract()
        const contractAddress = String((contract as any).target)
        console.log('[MINT] Contract address:', contractAddress)

        // If no recipient provided, default to treasury address
        const treasuryAddress = await contract.treasury()
        const target = recipient && recipient.length > 0 ? recipient : treasuryAddress

        console.log('[MINT] Treasury address:', treasuryAddress)
        console.log('[MINT] Target address (where tokens will be minted):', target)
        console.log('[MINT] Is minting to treasury?', target === treasuryAddress)

        const amountWei = ethers.parseEther(amount.toString())
        console.log('[MINT] Amount in tokens:', amount)
        console.log('[MINT] Amount in wei:', amountWei.toString())

        // Get balances before mint
        const treasuryBalanceBefore = await contract.balanceOf(treasuryAddress)
        const totalSupplyBefore = await contract.totalSupply()
        console.log('[MINT] Treasury balance BEFORE:', ethers.formatEther(treasuryBalanceBefore))
        console.log('[MINT] Total supply BEFORE:', ethers.formatEther(totalSupplyBefore))

        const tx = await contract.mint(target, amountWei)
        console.log('[MINT] Transaction sent:', tx.hash)

        const receipt = await tx.wait()
        console.log('[MINT] Transaction confirmed in block:', receipt.blockNumber)

        // Get balances after mint
        const treasuryBalanceAfter = await contract.balanceOf(treasuryAddress)
        const totalSupplyAfter = await contract.totalSupply()
        console.log('[MINT] Treasury balance AFTER:', ethers.formatEther(treasuryBalanceAfter))
        console.log('[MINT] Total supply AFTER:', ethers.formatEther(totalSupplyAfter))
        console.log('[MINT] Treasury balance increased by:', ethers.formatEther(treasuryBalanceAfter - treasuryBalanceBefore))
        console.log('[MINT] Total supply increased by:', ethers.formatEther(totalSupplyAfter - totalSupplyBefore))

        // Invalidate stats cache so dashboard shows updated values
        try {
            console.log('[MINT] Invalidating stats cache...')
            await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/invalidate-cache`, {
                method: 'POST'
            })
            console.log('[MINT] Stats cache invalidated successfully')
        } catch (cacheError) {
            console.error('[MINT] Failed to invalidate cache:', cacheError)
            // Don't fail the mint if cache invalidation fails
        }

        return NextResponse.json({
            success: true,
            txHash: tx.hash,
            to: target,
            treasuryAddress,
            mintedToTreasury: target === treasuryAddress,
            amount: amount,
            blockNumber: receipt.blockNumber
        })
    } catch (error: any) {
        console.error('[MINT] Error:', error)
        console.error('[MINT] Error stack:', error.stack)
        return NextResponse.json({ error: error.message || 'Mint failed' }, { status: 500 })
    }
}
