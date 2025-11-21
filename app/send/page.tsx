'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus, ArrowLeft, Sun, Moon, Loader2 } from 'lucide-react'
import CoinLogo from '../components/CoinLogo'
import LionLogoTransparent from '../components/LionLogoTransparent'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

export default function SendPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [carnet, setCarnet] = useState('')
  const [amount, setAmount] = useState('0')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [receiverInfo, setReceiverInfo] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [tokenSymbol, setTokenSymbol] = useState('TOKENS')
  const [balance, setBalance] = useState('0')
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  // Obtener carnet desde URL si viene del QR
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const carnetParam = params.get('carnet')
    if (carnetParam) {
      setCarnet(carnetParam)
      searchByCarnet(carnetParam)
    }
  }, [])

  // Obtener perfil del usuario y balance
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return
      
      // Cache de 30 segundos
      const now = Date.now()
      if (now - lastFetchTime < 30000) {
        console.log('⏭️ [SEND] Usando cache del cliente')
        return
      }
      
      try {
        const [profileRes, tokenRes] = await Promise.all([
          fetch(`/api/users/profile?userId=${user.id}`),
          fetch('/api/token/info')
        ])
        
        const profile = await profileRes.json()
        const token = await tokenRes.json()
        
        setUserProfile(profile)
        setTokenSymbol(token.symbol || 'TOKENS')
        
        if (profile.walletAddress) {
          const balanceRes = await fetch(`/api/users/balance?address=${profile.walletAddress}`)
          const balanceData = await balanceRes.json()
          setBalance(balanceData.balance)
        }
        
        setLastFetchTime(Date.now())
      } catch (e) {
        console.error('Error fetching user data:', e)
      }
    }
    
    fetchUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const searchByCarnet = async (carnetValue: string) => {
    if (!carnetValue.trim()) {
      setReceiverInfo(null)
      return
    }
    
    try {
      const res = await fetch(`/api/users/by-carnet?carnet=${carnetValue}`)
      if (res.ok) {
        const data = await res.json()
        setReceiverInfo(data)
        setError('')
      } else {
        setReceiverInfo(null)
        setError('Carnet no encontrado')
      }
    } catch (e) {
      console.error('Error searching carnet:', e)
      setReceiverInfo(null)
      setError('Error al buscar carnet')
    }
  }

  const handleIncrement = () => {
    const currentAmount = parseFloat(amount) || 0
    setAmount((currentAmount + 1).toString())
  }

  const handleDecrement = () => {
    const currentAmount = parseFloat(amount) || 0
    if (currentAmount > 0) {
      setAmount((currentAmount - 1).toString())
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleSend = () => {
    setError('')
    
    if (!receiverInfo) {
      setError('Busca un destinatario válido')
      return
    }
    
    if (!parseFloat(amount) || parseFloat(amount) <= 0) {
      setError('Ingresa una cantidad válida')
      return
    }
    
    if (parseFloat(amount) > parseFloat(balance)) {
      setError('Balance insuficiente')
      return
    }
    
    setShowConfirmation(true)
  }

  const handleConfirmSend = async () => {
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/users/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAddress: userProfile.walletAddress,
          toCarnet: carnet,
          amount
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar')
      }
      
      setShowConfirmation(false)
      router.push('/')
    } catch (e: any) {
      setError(e.message)
      setShowConfirmation(false)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Header */}
      <div className="bg-university-red px-5 py-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={24} color="white" />
          </button>
          <LionLogoTransparent size={40} />
          <button
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? <Sun size={20} color="white" /> : <Moon size={20} color="white" />}
          </button>
        </div>
      </div>

      {/* Send Card */}
      <div className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <div className={`rainbow-glow-border-thick w-full max-w-sm ${
          isDarkMode 
            ? 'bg-gray-900/95 border-gray-700/20' 
            : 'bg-white/95 border-white/20'
        } backdrop-blur-sm rounded-3xl shadow-2xl p-8 border transition-all duration-300`}>
          
          {/* Coin Logo */}
          <div className="flex justify-center mb-6">
            <CoinLogo size={100} />
          </div>

          {/* Carnet del Destinatario */}
          <div className="mb-6">
            <input
              type="text"
              value={carnet}
              onChange={(e) => {
                setCarnet(e.target.value)
                searchByCarnet(e.target.value)
              }}
              placeholder="Carnet del destinatario"
              className={`w-full px-4 py-3 rounded-xl border-2 text-center transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-university-red'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-university-red'
              } outline-none`}
            />
            {receiverInfo && (
              <div className={`mt-2 text-center text-sm ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                ✓ {receiverInfo.firstName} {receiverInfo.lastName}
              </div>
            )}
            {error && carnet && (
              <div className={`mt-2 text-center text-sm ${
                isDarkMode ? 'text-red-400' : 'text-red-600'
              }`}>
                {error}
              </div>
            )}
          </div>

          {/* Balance disponible */}
          <div className={`text-center mb-4 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Balance disponible: {parseFloat(balance).toFixed(4)} {tokenSymbol}
          </div>

          {/* Amount Section */}
          <div className={`rounded-3xl p-6 mb-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <h3 className={`text-center text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Cantidad
            </h3>
            
            {/* Amount Display with +/- buttons */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={handleDecrement}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-white hover:bg-gray-50 text-gray-900'
                }`}
              >
                <Minus size={24} />
              </button>
              
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className={`w-32 text-center text-3xl font-bold bg-transparent border-none outline-none ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              />
              
              <button
                onClick={handleIncrement}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-white hover:bg-gray-50 text-gray-900'
                }`}
              >
                <Plus size={24} />
              </button>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!receiverInfo || parseFloat(amount) <= 0 || loading}
            className={`w-full py-4 rounded-full text-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              !receiverInfo || parseFloat(amount) <= 0 || loading
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-university-red text-white hover:bg-university-red-light'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Enviando...
              </>
            ) : (
              'Enviar'
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl shadow-2xl p-8 ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`}>
            {/* Lion Logo */}
            <div className="flex justify-center mb-6">
              <LionLogoTransparent size={100} />
            </div>

            {/* Confirmation Text */}
            <h2 className={`text-center text-xl font-semibold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              ¿Confirmar envío?
            </h2>

            {/* Amount Display */}
            <div className={`rounded-3xl p-8 mb-6 border-2 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
            }`}>
              <p className={`text-center text-4xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {amount} {tokenSymbol}
              </p>
            </div>

            {/* To Text */}
            <p className={`text-center text-lg mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              para
            </p>

            {/* Receiver Info */}
            <div className={`text-center mb-8 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <p className="text-lg font-semibold">
                {receiverInfo?.firstName} {receiverInfo?.lastName}
              </p>
              <p className="text-sm text-gray-500">
                Carnet: {carnet}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
                className={`flex-1 py-3 rounded-full text-lg font-semibold transition-colors ${
                  isDarkMode
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                } disabled:opacity-50`}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSend}
                disabled={loading}
                className="flex-1 py-3 rounded-full text-lg font-semibold bg-university-red text-white hover:bg-university-red-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Enviando...
                  </>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
