'use client'

import { useState, useEffect } from 'react'
import { Send, CheckCircle2, AlertTriangle, Sun, Moon } from 'lucide-react'
import RainbowCard from '../../../components/admin/RainbowCard'
import LionLogoTransparent from '../../../app/components/LionLogoTransparent'
import CoinLogo from '../../../app/components/CoinLogo'
import { useTheme } from '../../../contexts/ThemeContext'

export default function MintPage() {
    const { isDarkMode, toggleDarkMode } = useTheme()
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

            <div className="max-w-2xl mx-auto">
                <RainbowCard className="h-full" isDarkMode={isDarkMode}>
                    <div className={`flex flex-col items-center text-center h-full ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="relative mb-6">
                            <div className={`w-24 h-24 rounded-full border-2 border-black flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'} z-10 relative overflow-hidden`}>
                                <CoinLogo size={90} />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold mb-8">Cantidad a Emitir</h2>

                        <div className="flex items-center gap-4 mb-8">
                            <div className={`w-48 h-32 rounded-3xl border-2 border-black flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                            setAmount(val)
                                        }
                                    }}
                                    placeholder="Cant. Tokens"
                                    className={`w-full text-center text-xl font-bold outline-none bg-transparent ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                                />
                            </div>
                            <div className="text-left">
                                <p className="text-xl font-bold">Tokens</p>
                                <p className="text-xl font-bold">a Emitir</p>
                            </div>
                        </div>

                        <div className="font-bold text-xl mb-4">PRX</div>

                        <button
                            onClick={handleSubmit}
                            disabled={status === 'loading' || !amount}
                            className="w-full bg-university-red text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {status === 'loading' ? 'Procesando...' : 'Emitir'}
                        </button>

                        {status === 'error' && (
                            <div className="mt-4 text-red-600 text-sm">{errorMessage}</div>
                        )}

                        {status === 'success' && (
                            <div className="mt-4 text-green-600 text-sm">
                                ¡Emisión exitosa!
                                {txHash && (
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block underline"
                                    >
                                        Ver en Etherscan
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </RainbowCard>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className={`rounded-2xl shadow-2xl p-8 max-w-md w-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <AlertTriangle className="text-yellow-600" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold">Confirmar Emisión</h2>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cantidad a emitir</p>
                                <p className="text-3xl font-bold">{parseFloat(amount).toLocaleString()} {tokenSymbol}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className={`flex-1 px-6 py-3 rounded-xl border-2 font-medium transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmMint}
                                className="flex-1 px-6 py-3 rounded-xl bg-university-red text-white font-bold hover:bg-university-red-light transition-colors"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
