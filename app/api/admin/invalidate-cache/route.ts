import { NextResponse } from 'next/server'

// This will be imported by the stats route to allow cache invalidation
export let statsCache: { data: any; ts: number } | null = null

export function invalidateStatsCache() {
    console.log('[CACHE] Invalidating stats cache')
    statsCache = null
}

export async function POST() {
    invalidateStatsCache()
    return NextResponse.json({ success: true, message: 'Cache invalidated' })
}
