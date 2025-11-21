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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Add a small delay to ensure component is mounted
    const timer = setTimeout(() => {
      startCamera()
    }, 100)
    
    return () => {
      clearTimeout(timer)
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setIsLoading(true)
      console.log('Starting camera...')
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device')
      }

      console.log('Requesting camera permission...')
      
      // Try rear camera first (for mobile devices)
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })
        console.log('Rear camera stream obtained')
      } catch (err) {
        // If rear camera fails, try front camera (for computers/laptops)
        console.log('Rear camera not available, trying front camera...', err)
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })
        console.log('Front camera stream obtained')
      }
      
      if (videoRef.current && stream) {
        console.log('Setting video source...')
        videoRef.current.srcObject = stream
        
        // Try to play immediately
        try {
          await videoRef.current.play()
          console.log('Video playing successfully')
          setHasPermission(true)
          setIsLoading(false)
        } catch (playErr) {
          console.error('Error playing video:', playErr)
          setHasPermission(false)
          setIsLoading(false)
          setError('Unable to start camera preview.')
        }
      } else {
        throw new Error('Video element not ready')
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err)
      setHasPermission(false)
      setIsLoading(false)
      
      // Provide more specific error messages
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found on this device.')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is already in use by another application.')
      } else if (err.message === 'Camera not supported on this device') {
        setError(err.message)
      } else {
        setError(`Unable to access camera: ${err.message || 'Unknown error'}`)
      }
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
    const mockCarnet = '20200090'
    stopCamera()
    router.push(`/send?carnet=${encodeURIComponent(mockCarnet)}`)
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
        {/* Hidden video element - always rendered so ref is available */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="hidden"
        />

        {(hasPermission === null || isLoading) && (
          <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-university-red mx-auto"></div>
            </div>
            <p className="text-lg">Requesting camera permission...</p>
            <p className="text-sm mt-2 opacity-70">Please allow camera access when prompted</p>
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
                autoPlay
                playsInline
                muted
                className="w-full aspect-square object-cover"
                ref={(el) => {
                  if (el && videoRef.current && videoRef.current.srcObject) {
                    el.srcObject = videoRef.current.srcObject
                  }
                }}
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
