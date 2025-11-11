import React from 'react'

interface RainbowButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  isDarkMode?: boolean
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export default function RainbowButton({
  children,
  onClick,
  className = '',
  isDarkMode = false,
  type = 'button',
  disabled = false
}: RainbowButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rainbow-glow-border transition-colors ${
        isDarkMode
          ? 'bg-gray-800 hover:bg-gray-700'
          : 'bg-white hover:bg-gray-50'
      } ${className}`}
    >
      {children}
    </button>
  )
}
