import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || '10')))
    const q = (searchParams.get('q') || '').trim()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!
    if (!supabaseUrl || !serviceRole) {
      return NextResponse.json({ error: 'Missing Supabase env vars' }, { status: 500 })
    }

    const admin = createClient(supabaseUrl, serviceRole)

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = admin
      .from('profiles')
      .select('id, role, university_id, first_name, last_name', { count: 'exact' })

    if (q) {
      // search by carnet (university_id)
      query = query.ilike('university_id', `%${q}%`)
    }

    const { data, count, error } = await query.range(from, to)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Obtener wallets para cada perfil
    const profileIds = (data || []).map((p: any) => p.id)
    const { data: wallets } = await admin
      .from('wallets')
      .select('user_id, address')
      .in('user_id', profileIds)

    // Crear mapa de wallets por user_id
    const walletMap = new Map((wallets || []).map((w: any) => [w.user_id, w.address]))

    // Mapear datos para incluir wallet_address
    const items = (data || []).map((item: any) => ({
      id: item.id,
      role: item.role,
      university_id: item.university_id,
      first_name: item.first_name,
      last_name: item.last_name,
      wallet_address: walletMap.get(item.id) || null
    }))

    return NextResponse.json({
      items,
      page,
      pageSize,
      total: count || 0,
      totalPages: count ? Math.ceil(count / pageSize) : 0,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
