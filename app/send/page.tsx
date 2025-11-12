'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus, ArrowLeft, Sun, Moon } from 'lucide-react'
import CoinLogo from '../components/CoinLogo'
import LionLogoTransparent from '../components/LionLogoTransparent'
import { useTheme } from '../../contexts/ThemeContext'

export default function SendPage() {
  const router = useRouter()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [receiverWallet, setReceiverWallet] = useState('')
  const [amount, setAmount] = useState('0')
  const [showConfirmation, setShowConfirmation] = useState(false)

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
    if (receiverWallet && parseFloat(amount) > 0) {
      setShowConfirmation(true)
    }
  }

  const handleConfirmSend = () => {
    console.log('Sending:', { receiverWallet, amount })
    // TODO: Implement send transaction
    setShowConfirmation(false)
    router.push('/')
  }

  // Truncate wallet address for display
  const truncateAddress = (address: string) => {
    if (address.length <= 13) return address
    return `${address.slice(0, 6)}...${address.slice(-5)}`
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

          {/* Receiver's Wallet Address */}
          <div className="mb-6">
            <input
              type="text"
              value={receiverWallet}
              onChange={(e) => setReceiverWallet(e.target.value)}
              placeholder="Receiver's Wallet Address"
              className={`w-full px-4 py-3 rounded-xl border-2 text-center transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-university-red'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-university-red'
              } outline-none`}
            />
          </div>

          {/* Amount Section */}
          <div className={`rounded-3xl p-6 mb-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <h3 className={`text-center text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Amount
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
            disabled={!receiverWallet || parseFloat(amount) <= 0}
            className={`w-full py-4 rounded-full text-lg font-semibold transition-colors ${
              !receiverWallet || parseFloat(amount) <= 0
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-university-red text-white hover:bg-university-red-light'
            }`}
          >
            Send
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
              Are you sure you want to send
            </h2>

            {/* Amount Display */}
            <div className={`rounded-3xl p-8 mb-6 border-2 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
            }`}>
              <p className={`text-center text-4xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {amount}
              </p>
            </div>

            {/* To Text */}
            <p className={`text-center text-lg mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              to
            </p>

            {/* Receiver Wallet */}
            <p className={`text-center text-lg font-semibold mb-8 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {truncateAddress(receiverWallet)}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className={`flex-1 py-3 rounded-full text-lg font-semibold transition-colors ${
                  isDarkMode
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                className="flex-1 py-3 rounded-full text-lg font-semibold bg-university-red text-white hover:bg-university-red-light transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
