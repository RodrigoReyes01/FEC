'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface ThemeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [userPreference, setUserPreference] = useState<'manual' | 'system'>('system')

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const savedPreference = localStorage.getItem('themePreference') as 'manual' | 'system' | null
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    if (savedPreference === 'manual' && savedTheme) {
      // User has manually set a preference
      setIsDarkMode(savedTheme === 'dark')
      setUserPreference('manual')
    } else {
      // Use system preference
      setIsDarkMode(mediaQuery.matches)
      setUserPreference('system')
    }
    setIsInitialized(true)

    // Listen for system theme changes (only if using system preference)
    const handleChange = (e: MediaQueryListEvent) => {
      const currentPreference = localStorage.getItem('themePreference')
      if (currentPreference !== 'manual') {
        setIsDarkMode(e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Save theme to localStorage only when manually toggled
  useEffect(() => {
    if (isInitialized && userPreference === 'manual') {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
      localStorage.setItem('themePreference', 'manual')
    }
  }, [isDarkMode, isInitialized, userPreference])

  // Apply theme class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    setUserPreference('manual')
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light')
    localStorage.setItem('themePreference', 'manual')
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}