'use client'

import { useState, useEffect } from 'react'
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

  // Create particles effect
  useEffect(() => {
    const canvas = document.getElementById('particles') as HTMLCanvasElement
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener('resize', setCanvasSize)

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.color = isDarkMode
          ? `rgba(255, 255, 255, ${Math.random() * 0.2})`
          : `rgba(255, 255, 255, ${Math.random() * 0.3})`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const particles: Particle[] = []
    const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000))

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    const animate = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const particle of particles) {
        particle.update()
        particle.draw()
      }
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', setCanvasSize)
    }
  }, [isDarkMode])

  return (
    <div className="min-h-screen bg-university-red relative overflow-hidden">
      <canvas id="particles" className="absolute inset-0 pointer-events-none"></canvas>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
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
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 origin-center whitespace-nowrap">
            <p className={`text-lg font-medium tracking-[0.5em] ${
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
                  ? 'bg-university-red text-white' 
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

      {/* Copy Notification */}
      {copied && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className={`px-6 py-3 rounded-full shadow-lg ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          } border-2 border-university-red`}>
            <p className="text-sm font-medium">Wallet address copied to clipboard</p>
          </div>
        </div>
      )}
    </div>
  )
}
