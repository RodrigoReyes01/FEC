'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import LionLogoTransparent from '../components/LionLogoTransparent'
import { useTheme } from '../../contexts/ThemeContext'

export default function ScanPage() {
  const router = useRouter()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      // Try rear camera first (for mobile devices)
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
      } catch (err) {
        // If rear camera fails, try front camera (for computers/laptops)
        console.log('Rear camera not available, trying front camera...', err)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true
        })
      }
      
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setHasPermission(true)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setHasPermission(false)
      setError('Unable to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const handleManualInput = () => {
    router.push('/send')
  }

  // Simulate QR code scan (in production, use a QR code library like jsQR)
  const handleTestScan = () => {
    const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
    stopCamera()
    router.push(`/send?address=${encodeURIComponent(mockAddress)}`)
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

      {/* Camera View */}
      <div className="relative flex flex-col items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        {hasPermission === null && (
          <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <p className="text-lg">Requesting camera permission...</p>
          </div>
        )}

        {hasPermission === false && (
          <div className="text-center">
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {error}
            </p>
            <button
              onClick={handleManualInput}
              className="px-6 py-3 bg-university-red text-white rounded-xl font-semibold hover:bg-university-red-light transition-colors"
            >
              Enter Address Manually
            </button>
          </div>
        )}

        {hasPermission && (
          <div className="w-full max-w-md">
            {/* Camera Preview */}
            <div className="relative rounded-3xl overflow-hidden mb-6">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full aspect-square object-cover"
              />
              
              {/* Scan Frame Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-university-red rounded-2xl"></div>
              </div>
            </div>

            {/* Instructions */}
            <p className={`text-center text-lg mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Position QR code within the frame
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleTestScan}
                className="w-full px-6 py-3 bg-university-red text-white rounded-xl font-semibold hover:bg-university-red-light transition-colors"
              >
                Test Scan (Demo)
              </button>
              <button
                onClick={handleManualInput}
                className={`w-full px-6 py-3 rounded-xl font-semibold transition-colors ${
                  isDarkMode
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                Enter Address Manually
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
