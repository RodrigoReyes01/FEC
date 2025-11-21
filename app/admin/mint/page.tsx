'use client'

import { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'

export default function MintPage() {
    const [recipient, setRecipient] = useState('')
    const [amount, setAmount] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const [txHash, setTxHash] = useState('')

    const handleMint = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')
        setErrorMessage('')
        setTxHash('')

        try {
            const response = await fetch('/api/admin/mint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipient, amount })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al acuñar tokens')
            }

            setTxHash(data.txHash)
            setStatus('success')
            setAmount('')
            setRecipient('')
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
                <p className="text-gray-500">Acuñar nuevos tokens y enviarlos a una dirección específica.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleMint} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dirección de Destino
                        </label>
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="0x..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-university-red focus:border-transparent outline-none transition-all"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Puede ser la dirección de un estudiante o la tesorería.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cantidad a Emitir
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                step="0.000001"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-university-red focus:border-transparent outline-none transition-all pr-16"
                                required
                            />
                            <span className="absolute right-4 top-3.5 text-gray-400 font-medium">TOKENS</span>
                        </div>
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
                        disabled={status === 'loading' || !recipient || !amount}
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
        </div>
    )
}
