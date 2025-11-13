'use client'

import { useEffect, useState } from 'react'
import LionLogoTransparent from '../app/components/LionLogoTransparent'
import { useTheme } from '../contexts/ThemeContext'

export default function LoadingScreen() {
  const { isDarkMode } = useTheme()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100
        return prev + 2
      })
    }, 30)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className="flex flex-col items-center justify-center space-y-8 px-8">
        {/* Lion Logo */}
        <div className="mb-4">
          <LionLogoTransparent size={120} />
        </div>

        {/* App Name */}
        <div className="text-center">
          <h1 className={`text-5xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            MoWa
          </h1>
          <p className={`text-xl ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Mobile Wallet
          </p>
        </div>

        {/* Infinity Loading Animation */}
        <div className="relative w-32 h-16">
          <svg
            viewBox="0 0 200 100"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Gray base infinity symbol */}
            <path
              d="M 50,50 C 50,30 30,30 30,50 C 30,70 50,70 50,50 C 50,30 70,30 100,50 C 130,70 150,70 170,50 C 170,30 150,30 150,50 C 150,70 170,70 170,50"
              fill="none"
              stroke={isDarkMode ? '#374151' : '#E5E7EB'}
              strokeWidth="12"
              strokeLinecap="round"
            />
            
            {/* Animated colored segment */}
            <path
              d="M 50,50 C 50,30 30,30 30,50 C 30,70 50,70 50,50 C 50,30 70,30 100,50 C 130,70 150,70 170,50 C 170,30 150,30 150,50 C 150,70 170,70 170,50"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="400"
              strokeDashoffset={400 - (progress * 4)}
              className="transition-all duration-300"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9333EA" />
                <stop offset="50%" stopColor="#C026D3" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Footer */}
        <div className="absolute bottom-12">
          <p className={`text-lg font-medium ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            By FEC
          </p>
        </div>
      </div>
    </div>
  )
}
