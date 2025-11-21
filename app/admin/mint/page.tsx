'use client'

import { useState, useEffect } from 'react'
import { Send, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function MintPage() {
    const [amount, setAmount] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const [txHash, setTxHash] = useState('')
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [currentSupply, setCurrentSupply] = useState('0')
    const [tokenSymbol, setTokenSymbol] = useState('TOKENS')

    useEffect(() => {
        // Fetch current supply and token info
        const fetchData = async () => {
            try {
                const [statsRes, tokenRes] = await Promise.all([
                    fetch('/api/admin/stats'),
                    fetch('/api/token/info')
                ])
                const stats = await statsRes.json()
                const token = await tokenRes.json()
                if (statsRes.ok) setCurrentSupply(stats.totalSupply || '0')
                if (tokenRes.ok) setTokenSymbol(token.symbol || 'TOKENS')
            } catch (e) {
                console.error('Error fetching data:', e)
            }
        }
        fetchData()
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || parseFloat(amount) <= 0) return
        setShowConfirmation(true)
    }

    const handleConfirmMint = async () => {
        setShowConfirmation(false)
        setStatus('loading')
        setErrorMessage('')
        setTxHash('')

        try {
            const response = await fetch('/api/admin/mint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al acuñar tokens')
            }

            setTxHash(data.txHash)
            setStatus('success')
            setAmount('')
        } catch (error: any) {
            console.error('Mint error:', error)
            setStatus('error')
            setErrorMessage(error.message || 'Error al acuñar tokens')
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Emisión de Moneda (Mint)</h1>
                <p className="text-gray-500">Acuñar nuevos tokens y enviarlos a la tesorería automáticamente.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cantidad a Emitir
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={amount}
                                onChange={(e) => {
                                    const val = e.target.value
                                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                        setAmount(val)
                                    }
                                }}
                                placeholder="0.00"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-0 focus:border-university-red outline-none transition-colors pr-24 bg-white placeholder-gray-400 text-gray-900 caret-university-red"
                                required
                            />
                            <span className="absolute right-4 top-3.5 text-gray-500 font-medium">{tokenSymbol}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Los tokens se acuñarán y enviarán a la tesorería.</p>
                    </div>

                    {status === 'error' && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                            {errorMessage}
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm flex items-center gap-2">
                            <CheckCircle2 size={18} />
                            <div>
                                <p className="font-bold">¡Emisión exitosa!</p>
                                {txHash && (
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs underline hover:text-green-800"
                                    >
                                        Ver transacción en Etherscan
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'loading' || !amount}
                        className="w-full bg-university-red text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {status === 'loading' ? (
                            'Procesando...'
                        ) : (
                            <>
                                <Send size={20} />
                                Emitir Tokens
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <AlertTriangle className="text-yellow-600" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Confirmar Emisión</h2>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Cantidad a emitir</p>
                                <p className="text-3xl font-bold text-gray-900">{parseFloat(amount).toLocaleString()} {tokenSymbol}</p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                    <AlertTriangle size={16} />
                                    Impacto en la Economía
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-blue-700">Suministro actual:</span>
                                        <span className="font-mono font-medium text-blue-900">{parseFloat(currentSupply).toLocaleString()} {tokenSymbol}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-700">Nuevo suministro:</span>
                                        <span className="font-mono font-medium text-blue-900">{(parseFloat(currentSupply) + parseFloat(amount || '0')).toLocaleString()} {tokenSymbol}</span>
                                    </div>
                                    <div className="border-t border-blue-200 pt-2 mt-2">
                                        <div className="flex justify-between">
                                            <span className="text-blue-700 font-bold">Inflación:</span>
                                            <span className="font-mono font-bold text-blue-900">
                                                +{parseFloat(currentSupply) > 0 
                                                    ? ((parseFloat(amount || '0') / parseFloat(currentSupply)) * 100).toFixed(2)
                                                    : '∞'
                                                }%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <p className="text-xs text-yellow-800">
                                    ⚠️ Esta acción aumentará el suministro total de tokens y puede diluir el valor de los tokens existentes.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmMint}
                                className="flex-1 px-6 py-3 rounded-xl bg-university-red text-white font-bold hover:bg-university-red-light transition-colors"
                            >
                                Confirmar Emisión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
