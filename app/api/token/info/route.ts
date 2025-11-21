import { NextResponse } from 'next/server'
import { getAdminContract } from '@/lib/adminWallet'

let CACHE: { data: any; ts: number } | null = null
const TTL_MS = 30 * 60 * 1000 // 30 minutes - token info casi nunca cambia

async function withRetry<T>(fn: () => Promise<T>, retries = 3, baseDelay = 300) {
  let attempt = 0
  let lastErr: any
  while (attempt < retries) {
    try {
      return await fn()
    } catch (e: any) {
      lastErr = e
      // Infura rate limit code -32005 or generic failures
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(res => setTimeout(res, delay))
      attempt++
    }
  }
  throw lastErr
}

export async function GET() {
  try {
    // Serve from cache
    if (CACHE && Date.now() - CACHE.ts < TTL_MS) {
      return NextResponse.json(CACHE.data)
    }

    const contract = getAdminContract()

    const [name, symbol, decimals] = await withRetry(async () => Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
    ]))

    const address = String((contract as any).target)

    const data = {
      address: String(address),
      name: String(name),
      symbol: String(symbol),
      decimals: Number(decimals),
      network: 'sepolia',
      chainId: 11155111,
    }

    CACHE = { data, ts: Date.now() }
    return NextResponse.json(data)
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : 'Failed to fetch token info'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
