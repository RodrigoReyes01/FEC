'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Sun, Moon } from 'lucide-react'
import LionLogoTransparent from '../components/LionLogoTransparent'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import QRCode from 'qrcode'

export default function QRPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [copied, setCopied] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [qrCode, setQrCode] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const res = await fetch(`/api/users/profile?userId=${user.id}`)
        const profile = await res.json()
        setUserProfile(profile)

        // Generar QR con el carnet
        if (profile.universityId) {
          const qr = await QRCode.toDataURL(profile.universityId, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          })
          setQrCode(qr)
        }
      } catch (e) {
        console.error('Error fetching profile:', e)
      }
    }

    fetchProfile()
  }, [user])

  const handleCopyCarnet = () => {
    if (userProfile?.universityId) {
      navigator.clipboard.writeText(userProfile.universityId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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
        <div className={`rainbow-glow-border-thick w-full max-w-sm ${isDarkMode
            ? 'bg-gray-900/95 border-gray-700/20'
            : 'bg-white/95 border-white/20'
          } backdrop-blur-sm rounded-3xl shadow-2xl p-6 border transition-all duration-300`}>

          {/* University ID Label */}
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 origin-center whitespace-nowrap">
            <p className={`text-lg font-medium tracking-[0.5em] ${isDarkMode ? 'text-gray-700' : 'text-gray-400'
              }`}>
              {userProfile?.universityId || 'CARNET'}
            </p>
          </div>

          {/* Lion Logo */}
          <div className="flex justify-center mb-3">
            <LionLogoTransparent size={90} />
          </div>

          {/* User Name */}
          <h1 className={`text-2xl font-bold text-center mb-1 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            {userProfile?.firstName} {userProfile?.lastName}
          </h1>

          {/* Carnet */}
          <p className={`text-base text-center mb-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Carnet: {userProfile?.universityId}
          </p>

          {/* QR Code */}
          <div className="flex justify-center mb-4">
            {qrCode ? (
              <img src={qrCode} alt="QR Code" className="w-48 h-48 rounded-2xl" />
            ) : (
              <div className={`w-48 h-48 rounded-2xl flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                } border-2`}>
                <p className={`text-base transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                  Cargando QR...
                </p>
              </div>
            )}
          </div>

          {/* Carnet para copiar */}
          <div className={`flex items-center justify-center gap-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            <p className={`text-sm font-mono transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
              {userProfile?.universityId || 'Sin carnet'}
            </p>
            <button
              onClick={handleCopyCarnet}
              className={`p-1.5 rounded-lg transition-colors ${copied
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
          <div className={`px-6 py-3 rounded-full shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            } border-2 border-university-red`}>
            <p className="text-sm font-medium">Wallet address copied to clipboard</p>
          </div>
        </div>
      )}
    </div>
  )
}
