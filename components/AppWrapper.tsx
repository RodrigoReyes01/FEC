'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import LoadingScreen from './LoadingScreen'
import { useAuth } from '../contexts/AuthContext'

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [showLoading, setShowLoading] = useState(true)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLoadingComplete = () => {
    setIsInitialLoading(false)
    setShowLoading(false)
  }

  useEffect(() => {
    // After initial loading and auth check, redirect if needed
    if (!isInitialLoading && !authLoading) {
      const publicPaths = ['/login', '/signup']
      const isPublicPath = publicPaths.includes(pathname)

      if (!isAuthenticated && !isPublicPath) {
        // Not authenticated and trying to access protected route -> redirect to login
        router.push('/login')
      } else if (isAuthenticated && isPublicPath) {
        // Authenticated and on login/signup page -> redirect to home
        router.push('/')
      }
    }
  }, [isInitialLoading, authLoading, isAuthenticated, pathname, router])

  if (showLoading || authLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  return <>{children}</>
}
