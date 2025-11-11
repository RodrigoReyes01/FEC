'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Sun, Moon } from 'lucide-react'
import CoinLogo from '../components/CoinLogo'
import { useTheme } from '../../contexts/ThemeContext'

export default function QRPage() {
  const router = useRouter()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [copied, setCopied] = useState(false)

  // Mock user data - replace with actual data from backend
  const userData = {
    name: 'Rodrigo Reyes',
    username: '@rodrigoreyes',
    universityId: '20200090',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  }

  // Truncate wallet address for display
  const truncateAddress = (address: string) => {
    if (address.length <= 13) return address
    return `${address.slice(0, 6)}...${address.slice(-5)}`
  }

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(userData.walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <button
          onClick={() => router.back()}
          className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
            isDarkMode
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-white text-gray-900 hover:bg-gray-50'
          }`}
        >
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
            isDarkMode
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-white text-gray-900 hover:bg-gray-50'
          }`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* QR Card */}
      <div className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <div className={`rainbow-glow-border-thick w-full max-w-sm ${
          isDarkMode 
            ? 'bg-gray-900/95 border-gray-700/20' 
            : 'bg-white/95 border-white/20'
        } backdrop-blur-sm rounded-3xl shadow-2xl p-6 border transition-all duration-300`}>
          
          {/* University ID Label */}
          <div className="absolute -left-10 top-1/3 -translate-y-1/2 -rotate-90 origin-center whitespace-nowrap">
            <p className={`text-2xl font-medium tracking-[0.5em] ${
              isDarkMode ? 'text-gray-700' : 'text-gray-400'
            }`}>
              {userData.universityId}
            </p>
          </div>

          {/* Coin Logo */}
          <div className="flex justify-center mb-3">
            <CoinLogo size={90} />
          </div>

          {/* User Name */}
          <h1 className={`text-2xl font-bold text-center mb-1 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {userData.name}
          </h1>

          {/* Username */}
          <p className={`text-base text-center mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {userData.username}
          </p>

          {/* User QR Placeholder */}
          <div className="flex justify-center mb-4">
            <div className={`w-48 h-48 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
            } border-2`}>
              <p className={`text-base transition-colors duration-300 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                User QR
              </p>
            </div>
          </div>

          {/* Wallet Address */}
          <div className={`flex items-center justify-center gap-2 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <p className={`text-sm font-mono transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {truncateAddress(userData.walletAddress)}
            </p>
            <button
              onClick={handleCopyWallet}
              className={`p-1.5 rounded-lg transition-colors ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
