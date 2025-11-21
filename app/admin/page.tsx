'use client'

import { useEffect, useState } from 'react'
import RainbowCard from '../../components/admin/RainbowCard'
import LionLogoTransparent from '../../app/components/LionLogoTransparent'
import MiniGraph from '../../components/admin/MiniGraph'
import { Sun, Moon, DollarSign, Wallet } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import Image from 'next/image'

export default function AdminDashboard() {
    const { isDarkMode, toggleDarkMode } = useTheme()
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
        return <div className="p-8 text-center">Cargando...</div>
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center bg-[#722F37] -mx-8 -mt-8 px-8 py-4 mb-8">
                <div className="flex-1"></div>
                <div className="flex justify-center">
                    <LionLogoTransparent size={40} />
                </div>
                <div className="flex-1 flex justify-end">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Suministro Total Card */}
                <RainbowCard className="h-full" isDarkMode={isDarkMode}>
                    <div className={`flex flex-col items-center text-center h-full ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="relative mb-6">
                            <div className={`w-24 h-24 rounded-full border-2 border-black flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'} z-10 relative overflow-hidden`}>
                                <Image src="/lionlogo-transparent.png" alt="Lion Logo" width={90} height={90} className="object-contain" />
                            </div>
                            <div className={`absolute -top-2 -right-12 w-16 h-16 rounded-full border-2 border-black flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <DollarSign size={32} className="text-green-600" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold mb-8">Suministro Total</h2>

                        <div className="flex items-center gap-4 mb-8">
                            <div className={`w-32 h-32 rounded-3xl border-2 border-black flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <span className="text-lg font-bold break-all">
                                    {parseFloat(stats.totalSupply).toLocaleString()}
                                </span>
                            </div>
                            <div className="text-left">
                                <p className="text-xl font-bold">Tokens</p>
                                <p className="text-xl font-bold">en circulacion</p>
                            </div>
                        </div>

                        <div className="font-bold text-xl mb-4">PRX</div>

                        <div className={`w-full h-48 rounded-3xl border-2 border-black flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} mt-auto overflow-hidden`}>
                            <MiniGraph color="#722F37" />
                        </div>
                    </div>
                </RainbowCard>

                {/* Tesoreria Card */}
                <RainbowCard className="h-full" isDarkMode={isDarkMode}>
                    <div className={`flex flex-col items-center text-center h-full ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="relative mb-6">
                            <div className={`w-24 h-24 rounded-full border-2 border-black flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'} z-10 relative overflow-hidden`}>
                                <Image src="/lionlogo-transparent.png" alt="Lion Logo" width={90} height={90} className="object-contain" />
                            </div>
                            <div className={`absolute -top-2 -right-12 w-16 h-16 rounded-full border-2 border-black flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <Wallet size={32} className="text-blue-600" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold mb-8">Tesoreria</h2>

                        <div className="flex items-center gap-4 mb-8">
                            <div className={`w-32 h-32 rounded-3xl border-2 border-black flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <span className="text-lg font-bold break-all">
                                    {parseFloat(stats.treasuryBalance).toLocaleString()}
                                </span>
                            </div>
                            <div className="text-left">
                                <p className="text-xl font-bold">Tokens</p>
                                <p className="text-xl font-bold">Recaudados</p>
                            </div>
                        </div>

                        <div className="font-bold text-xl mb-4">PRX</div>

                        <div className={`w-full h-48 rounded-3xl border-2 border-black flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} mt-auto overflow-hidden`}>
                            <MiniGraph color="#4ade80" />
                        </div>
                    </div>
                </RainbowCard>
            </div>
        </div>
    )
}
