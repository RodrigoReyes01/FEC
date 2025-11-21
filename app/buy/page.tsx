'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sun, Moon, CreditCard, Loader2, CheckCircle2 } from 'lucide-react'
import LionLogoTransparent from '../components/LionLogoTransparent'
import CoinLogo from '../components/CoinLogo'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

export default function BuyPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isDarkMode, toggleDarkMode } = useTheme()
  
  const [amountGTQ, setAmountGTQ] = useState('')
  const [tokenAmount, setTokenAmount] = useState('0')
  const [tokenSymbol, setTokenSymbol] = useState('TOKENS')
  const [tokenName, setTokenName] = useState('Token')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Datos de tarjeta
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  
  // Tasa de cambio: 1 GTQ = 10 PRAXEUM
  const EXCHANGE_RATE = 10
  const MAX_PRAXEUM = 300

  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        const res = await fetch('/api/token/info')
        const data = await res.json()
        if (res.ok) {
          setTokenSymbol(data.symbol || 'TOKENS')
          setTokenName(data.name || 'Token')
        }
      } catch (e) {
        console.error('Error fetching token info:', e)
      }
    }
    
    fetchTokenInfo()
  }, [])

  useEffect(() => {
    if (amountGTQ) {
      const gtq = parseFloat(amountGTQ) || 0
      const tokens = (gtq * EXCHANGE_RATE).toFixed(4)
      setTokenAmount(tokens)
    } else {
      setTokenAmount('0')
    }
  }, [amountGTQ])

  const handleContinue = () => {
    if (!amountGTQ || parseFloat(amountGTQ) <= 0) return
    setShowPaymentForm(true)
  }

  const handlePayment = async () => {
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      alert('Por favor completa todos los campos')
      return
    }
    
    setProcessing(true)
    
    try {
      // Simular validación de tarjeta
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Procesar compra real - transferir desde tesorería
      const res = await fetch('/api/users/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          amountTokens: tokenAmount
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la compra')
      }
      
      setProcessing(false)
      setSuccess(true)
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error: any) {
      setProcessing(false)
      alert('Error: ' + error.message)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4)
    }
    return v
  }

  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-6">
              <CheckCircle2 size={80} className="text-green-600" />
            </div>
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ¡Compra Exitosa!
          </h1>
          <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Has comprado {tokenAmount} {tokenSymbol}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Redirigiendo...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Header */}
      <div className="bg-university-red px-5 py-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => showPaymentForm ? setShowPaymentForm(false) : router.back()}
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

      {/* Main Content */}
      <div className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        {!showPaymentForm ? (
          // Paso 1: Ingresar monto
          <div className={`w-full max-w-sm ${
            isDarkMode 
              ? 'bg-gray-900/95 border-gray-700/20' 
              : 'bg-white/95 border-white/20'
          } backdrop-blur-sm rounded-3xl shadow-2xl p-8 border transition-all duration-300`}>
            
            <div className="flex justify-center mb-6">
              <CoinLogo size={100} />
            </div>

            <h2 className={`text-2xl font-bold text-center mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Comprar {tokenName}
            </h2>
            
            <p className={`text-center mb-6 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Tasa: 1 GTQ = {EXCHANGE_RATE} {tokenSymbol}
            </p>
            
            <p className={`text-center mb-6 text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Límite máximo: {MAX_PRAXEUM} {tokenSymbol}
            </p>

            {/* Monto en Quetzales */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Monto en Quetzales (GTQ)
              </label>
              <div className="relative">
                <span className={`absolute left-4 top-3.5 text-lg ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Q
                </span>
                <input
                  type="text"
                  value={amountGTQ}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      setAmountGTQ(val)
                    }
                  }}
                  placeholder="0.00"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 text-center text-xl transition-colors ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-university-red'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-university-red'
                  } outline-none`}
                />
              </div>
            </div>

            {/* Recibirás */}
            <div className={`rounded-xl p-4 mb-6 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <p className={`text-sm mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Recibirás
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {tokenAmount} {tokenSymbol}
              </p>
            </div>

            {parseFloat(tokenAmount) > MAX_PRAXEUM && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <p className="text-red-600 text-sm text-center">
                  ⚠️ Excede el límite de {MAX_PRAXEUM} {tokenSymbol}
                </p>
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={!amountGTQ || parseFloat(amountGTQ) <= 0 || parseFloat(tokenAmount) > MAX_PRAXEUM}
              className={`w-full py-4 rounded-full text-lg font-semibold transition-colors ${
                !amountGTQ || parseFloat(amountGTQ) <= 0 || parseFloat(tokenAmount) > MAX_PRAXEUM
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-university-red text-white hover:bg-university-red-light'
              }`}
            >
              Continuar
            </button>
          </div>
        ) : (
          // Paso 2: Formulario de pago
          <div className={`w-full max-w-md ${
            isDarkMode 
              ? 'bg-gray-900/95 border-gray-700/20' 
              : 'bg-white/95 border-white/20'
          } backdrop-blur-sm rounded-3xl shadow-2xl p-8 border transition-all duration-300`}>
            
            <div className="flex items-center justify-center mb-6">
              <div className="bg-university-red/10 p-4 rounded-full">
                <CreditCard size={40} className="text-university-red" />
              </div>
            </div>

            <h2 className={`text-2xl font-bold text-center mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Información de Pago
            </h2>
            
            <p className={`text-center mb-6 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Total: Q{parseFloat(amountGTQ).toFixed(2)}
            </p>

            <div className="space-y-4 mb-6">
              {/* Número de tarjeta */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Número de Tarjeta
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-university-red'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-university-red'
                  } outline-none`}
                />
              </div>

              {/* Nombre en tarjeta */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Nombre en la Tarjeta
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  placeholder="JUAN PEREZ"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-university-red'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-university-red'
                  } outline-none`}
                />
              </div>

              {/* Fecha y CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Vencimiento
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    placeholder="MM/AA"
                    maxLength={5}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-university-red'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-university-red'
                    } outline-none`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setCvv(val.slice(0, 3))
                    }}
                    placeholder="123"
                    maxLength={3}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-university-red'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-university-red'
                    } outline-none`}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className={`w-full py-4 rounded-full text-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                processing
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-university-red text-white hover:bg-university-red-light'
              }`}
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Procesando...
                </>
              ) : (
                `Pagar Q${parseFloat(amountGTQ).toFixed(2)}`
              )}
            </button>

            <p className={`text-xs text-center mt-4 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              🔒 Pago seguro simulado (Mockup)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
