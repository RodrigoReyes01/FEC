'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

export default function UsersPage() {
    const [q, setQ] = useState('')
    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)
    const [items, setItems] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [tableLoading, setTableLoading] = useState(false)

    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    const fetchList = async () => {
        setTableLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
            if (q.trim()) params.set('q', q.trim())
            const res = await fetch(`/api/admin/users/list?${params.toString()}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Error al cargar estudiantes')
            setItems(data.items || [])
            setTotal(data.total || 0)
        } catch (e) {
            console.error(e)
            setItems([])
            setTotal(0)
        } finally {
            setTableLoading(false)
        }
    }

    useEffect(() => {
        fetchList()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize])

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchList()
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <p className="text-gray-500">Buscar estudiantes por carnet universitario.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <form onSubmit={handleSearchSubmit} className="flex gap-4 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar por carnet"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-0 focus:border-university-red outline-none transition-colors bg-white placeholder-gray-400"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-university-red text-white px-8 py-3 rounded-xl font-medium hover:bg-university-red-light transition-colors"
                    >
                        Buscar
                    </button>
                </form>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500">
                                <th className="py-3 px-4">Carnet</th>
                                <th className="py-3 px-4">Nombre</th>
                                <th className="py-3 px-4">Wallet</th>
                                <th className="py-3 px-4">Rol</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableLoading ? (
                                <tr><td className="py-6 px-4" colSpan={4}>Cargando...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td className="py-6 px-4" colSpan={4}>Sin resultados</td></tr>
                            ) : (
                                items.map((it) => (
                                    <tr key={it.id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-mono text-gray-700">{it.university_id || '-'}</td>
                                        <td className="py-3 px-4 text-gray-900">{[it.first_name, it.last_name].filter(Boolean).join(' ') || '-'}</td>
                                        <td className="py-3 px-4 font-mono text-xs text-gray-600">{it.wallet_address || '-'}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                it.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {it.role || '-'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                        Página {page} de {totalPages} · {total} resultados
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >Anterior</button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
