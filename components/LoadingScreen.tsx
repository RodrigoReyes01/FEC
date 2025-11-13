'use client'

import { useEffect, useState } from 'react'
import LionLogoTransparent from '../app/components/LionLogoTransparent'
import { useTheme } from '../contexts/ThemeContext'

interface LoadingScreenProps {
  onComplete?: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const { isDarkMode } = useTheme()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // When progress reaches 100%, wait a bit then call onComplete
    if (progress === 100 && onComplete) {
      const timer = setTimeout(() => {
        onComplete()
      }, 500) // Small delay after animation completes
      return () => clearTimeout(timer)
    }
  }, [progress, onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-university-red">
      <div className="flex flex-col items-center justify-center space-y-8 px-8">
        {/* Lion Logo */}
        <div className="mb-4">
          <LionLogoTransparent size={120} />
        </div>

        {/* App Name */}
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-2 text-white">
            MoWa
          </h1>
          <p className="text-xl text-white/90">
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
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            
            {/* Animated colored segment */}
            <path
              d="M 50,50 C 50,30 30,30 30,50 C 30,70 50,70 50,50 C 50,30 70,30 100,50 C 130,70 150,70 170,50 C 170,30 150,30 150,50 C 150,70 170,70 170,50"
              fill="none"
              stroke="url(#animatedGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="400"
              strokeDashoffset={400 - (progress * 4)}
              className="transition-all duration-300"
            />
            
            {/* Gradient definition - Animated Rainbow */}
            <defs>
              <linearGradient id="animatedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF0080">
                  <animate
                    attributeName="stop-color"
                    values="#FF0080; #FF8C00; #40E0D0; #FF0080"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="33%" stopColor="#FF8C00">
                  <animate
                    attributeName="stop-color"
                    values="#FF8C00; #40E0D0; #FF0080; #FF8C00"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="66%" stopColor="#40E0D0">
                  <animate
                    attributeName="stop-color"
                    values="#40E0D0; #FF0080; #FF8C00; #40E0D0"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="100%" stopColor="#FF0080">
                  <animate
                    attributeName="stop-color"
                    values="#FF0080; #FF8C00; #40E0D0; #FF0080"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </stop>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Footer */}
        <div className="absolute bottom-12">
          <p className="text-lg font-medium text-white/80">
            By FEC
          </p>
        </div>
      </div>
    </div>
  )
}
