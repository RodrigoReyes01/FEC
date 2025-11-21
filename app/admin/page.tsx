'use client'

import { useEffect, useState } from 'react'
import { Coins, Wallet, Clock, AlertTriangle } from 'lucide-react'
import StatCard from '../../components/admin/StatCard'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalSupply: '0',
        treasuryBalance: '0',
        inactivityPeriod: '0',
        penaltyRate: '0'
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats')
                const data = await response.json()

                if (response.ok) {
                    setStats(data)
                } else {
                    console.error('Error fetching stats:', data.error)
                }
            } catch (error) {
                console.error('Error fetching stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resumen General</h1>
                    <p className="text-gray-500">Visión general de la economía del token</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 text-sm">
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">ADMIN MODE</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Supply"
                    value={parseFloat(stats.totalSupply).toLocaleString()}
                    subtitle="Tokens en circulación"
                    icon={<Coins size={24} />}
                    loading={loading}
                />
                <StatCard
                    title="Tesorería"
                    value={parseFloat(stats.treasuryBalance).toLocaleString()}
                    subtitle="Tokens recaudados"
                    icon={<Wallet size={24} />}
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
