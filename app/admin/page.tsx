'use client'

import { useEffect, useState } from 'react'
import { Coins, Wallet, Clock, AlertTriangle, Fuel } from 'lucide-react'
import StatCard from '../../components/admin/StatCard'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalSupply: '0',
        treasuryBalance: '0',
        inactivityPeriod: '0',
        penaltyRate: '0',
        adminEthBalance: '0',
        adminWalletAddress: ''
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [token, setToken] = useState<{ name: string; symbol: string; decimals: number } | null>(null)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, tokenRes] = await Promise.all([
                    fetch('/api/admin/stats'),
                    fetch('/api/token/info')
                ])
                const data = await statsRes.json()
                const tokenData = tokenRes.ok ? await tokenRes.json() : null

                if (statsRes.ok) {
                    setStats(data)
                } else {
                    console.error('Error fetching stats:', data.error)
                    setError(data.error || 'No se pudieron cargar las estadísticas')
                }

                if (tokenData && !tokenData.error) {
                    setToken({
                        name: tokenData.name,
                        symbol: tokenData.symbol,
                        decimals: tokenData.decimals,
                    })
                }
            } catch (error) {
                console.error('Error fetching stats:', error)
                setError((error as any)?.message || 'Error de red al cargar datos')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                            <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
                            <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 w-16 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">Resumen General</h1>
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
                    <p className="font-medium">No se pudo cargar la información del token.</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resumen General</h1>
                    <p className="text-gray-500">{token ? `${token.name} (${token.symbol})` : 'Visión general de la economía del token'}</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 text-sm">
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">ADMIN MODE</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                    title="Suministro total"
                    value={parseFloat(stats.totalSupply).toLocaleString()}
                    subtitle={token ? `Tokens en circulación (${token.symbol})` : 'Tokens en circulación'}
                    icon={<Coins size={24} />}
                    loading={loading}
                />
                <StatCard
                    title="Tesorería"
                    value={parseFloat(stats.treasuryBalance).toLocaleString()}
                    subtitle={token ? `Tokens recaudados (${token.symbol})` : 'Tokens recaudados'}
                    icon={<Wallet size={24} />}
                    loading={loading}
                />
                <StatCard
                    title="Gas (Sepolia ETH)"
                    value={parseFloat(stats.adminEthBalance).toFixed(4)}
                    subtitle="Balance para transacciones"
                    icon={<Fuel size={24} />}
                    loading={loading}
                />
                <StatCard
                    title="Periodo Inactividad"
                    value={`${stats.inactivityPeriod} días`}
                    subtitle="Tiempo límite"
                    icon={<Clock size={24} />}
                    loading={loading}
                />
                <StatCard
                    title="Tasa Penalización"
                    value={`${stats.penaltyRate}%`}
                    subtitle="Por inactividad"
                    icon={<AlertTriangle size={24} />}
                    loading={loading}
                />
            </div>
        </div>
    )
}
