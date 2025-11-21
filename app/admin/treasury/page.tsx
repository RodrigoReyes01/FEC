'use client'

import { useState, useEffect } from 'react'
import { Building2, ArrowRightLeft, AlertTriangle, Sun, Moon } from 'lucide-react'
import { ethers } from 'ethers'
import LionLogoTransparent from '../../../app/components/LionLogoTransparent'
import { useTheme } from '../../../contexts/ThemeContext'

export default function TreasuryPage() {
    const { isDarkMode, toggleDarkMode } = useTheme()
    const [currentTreasury, setCurrentTreasury] = useState('')
    const [newTreasury, setNewTreasury] = useState('')
    const [treasuryBalance, setTreasuryBalance] = useState('0')
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false) // New state to manage admin status for UI

    useEffect(() => {
        const fetchTreasury = async () => {
            try {
                // Fetch treasury address
                const treasuryResponse = await fetch('/api/admin/treasury')
                const treasuryData = await treasuryResponse.json()

                if (treasuryResponse.ok && treasuryData.treasury) {
                    setCurrentTreasury(treasuryData.treasury)
                } else {
                    console.error('Error fetching treasury address:', treasuryData.error || 'Unknown error')
                }

                // Fetch treasury balance and admin status
                const statsResponse = await fetch('/api/admin/stats')
                const statsData = await statsResponse.json()
                if (statsResponse.ok) {
                    setTreasuryBalance(statsData.treasuryBalance)
                    setIsAdmin(statsData.isAdmin) // Assuming API returns isAdmin status
                } else {
                    console.error('Error fetching stats:', statsData.error || 'Unknown error')
                }

            } catch (error) {
                console.error('Error fetching treasury or stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTreasury()
    }, [])

    const handleUpdateTreasury = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!ethers.isAddress(newTreasury)) { // Client-side validation for address format
            alert('Por favor, introduce una dirección de Ethereum válida.')
            return
        }

        setUpdating(true)
        try {
            const response = await fetch('/api/admin/treasury', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newTreasury })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Error desconocido al actualizar la tesorería.')

            setCurrentTreasury(newTreasury)
            setNewTreasury('')
            alert('Dirección de tesorería actualizada exitosamente')
        } catch (error: any) {
            console.error('Error updating treasury:', error)
            alert('Error al actualizar tesorería: ' + error.message)
        } finally {
            setUpdating(false)
        }
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

            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Configuración de Tesorería</h1>
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Gestionar la cuenta receptora de penalizaciones.</p>
                </div>

                {/* Current Treasury Card */}
                <div className={`rounded-2xl shadow-sm border p-8 mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-start gap-4">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                            <Building2 size={32} />
                        </div>
                        <div>
                            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tesorería Actual</h2>
                            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Esta cuenta recibe todos los tokens cobrados por penalizaciones de inactividad.</p>

                            {loading ? (
                                <div className="animate-pulse h-8 w-64 bg-gray-200 rounded"></div>
                            ) : (
                                <div className="space-y-2">
                                    <div className={`font-mono px-4 py-2 rounded-lg border break-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                        {currentTreasury}
                                    </div>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Balance: <span className="text-green-600 font-bold">{parseFloat(treasuryBalance).toLocaleString()} TOKENS</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Update Form */}
                <div className={`rounded-2xl shadow-sm border p-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h3 className={`font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <ArrowRightLeft size={20} />
                        Cambiar Dirección de Tesorería
                    </h3>

                    <form onSubmit={handleUpdateTreasury} className="space-y-6">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Nueva Dirección de Tesorería
                            </label>
                            <input
                                type="text"
                                value={newTreasury}
                                onChange={(e) => setNewTreasury(e.target.value)}
                                placeholder="0x..."
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-university-red focus:border-transparent outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-200 placeholder-gray-400'}`}
                                required
                            />
                            <p className="text-xs text-red-500 mt-2">
                                ⚠️ Asegúrate de tener acceso a esta dirección. Los fondos enviados aquí no se pueden recuperar si pierdes el acceso.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={updating || !newTreasury}
                            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {updating ? 'Actualizando...' : 'Actualizar Tesorería'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
