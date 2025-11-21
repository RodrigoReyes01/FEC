'use client'

import { useEffect } from 'react'

export default function PWA() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const register = async () => {
        try {
          await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        } catch (e) {
          // noop
        }
      }
      register()
    }
  }, [])

  return null
}
