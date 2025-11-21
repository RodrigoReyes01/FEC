'use client'

import { useState } from 'react'
import { Search, Shield, ShieldAlert, Clock, Activity } from 'lucide-react'

export default function UsersPage() {
    const [searchAddress, setSearchAddress] = useState('')
    const [userData, setUserData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchAddress) return

        setLoading(true)
        setUserData(null)

        try {
            const response = await fetch(`/api/admin/users/search?address=${searchAddress}`)
            const data = await response.json()

            if (response.ok) {
                setUserData(data)
            } else {
                console.error('Error fetching user data:', data.error)
                alert('Error al buscar usuario: ' + (data.error || 'Desconocido'))
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleExemption = async () => {
        if (!userData) return

        setActionLoading(true)
        try {
            const response = await fetch('/api/admin/users/exempt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: userData.address,
                    exempt: !userData.isExempt
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error)

            // Refresh data
            setUserData({ ...userData, isExempt: !userData.isExempt })
        } catch (error: any) {
            console.error('Error toggling exemption:', error)
            alert('Error al cambiar estado de exención: ' + error.message)
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <p className="text-gray-500">Inspeccionar estado de cuentas y gestionar exenciones de penalización.</p>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchAddress}
                            onChange={(e) => setSearchAddress(e.target.value)}
                            placeholder="Buscar por dirección de billetera (0x...)"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-university-red focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !searchAddress}
                        className="bg-gray-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>
            </div>

            {/* Results */}
            {userData && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <div>
                            <h2 className="font-bold text-lg text-gray-900">Detalles de la Cuenta</h2>
                            <p className="text-sm text-gray-500 font-mono">{userData.address}</p>
                        </div>
                        {userData.isExempt ? (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                                <Shield size={16} /> Exento de Penalización
                            </span>
                        ) : (
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                                <ShieldAlert size={16} /> Sujeto a Penalización
                            </span>
                        )}
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Balance Actual</p>
                            <p className="text-2xl font-bold text-gray-900">{parseFloat(userData.balance).toLocaleString()} TOKENS</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                                <Activity size={14} /> Última Actividad
                            </p>
                            <p className="text-lg font-medium text-gray-900">{userData.lastActivity}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                                <Clock size={14} /> Tiempo hasta Penalización
                            </p>
                            <p className={`text-lg font-medium ${Number(userData.timeUntilPenalty) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {Number(userData.timeUntilPenalty) < 0
                                    ? 'Penalización aplicable ahora'
                                    : `${userData.timeUntilPenalty} días`}
                            </p>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                        <h3 className="font-bold text-gray-900 mb-4">Acciones Administrativas</h3>
                        <button
                            onClick={toggleExemption}
                            disabled={actionLoading}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${userData.isExempt
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                        >
                            {actionLoading ? 'Procesando...' : (
                                userData.isExempt ? 'Revocar Exención' : 'Otorgar Exención'
                            )}
                        </button>
                        <p className="text-xs text-gray-500 mt-2">
                            {userData.isExempt
                                ? 'Esta cuenta no paga penalizaciones por inactividad.'
                                : 'Esta cuenta pagará penalizaciones si permanece inactiva.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
