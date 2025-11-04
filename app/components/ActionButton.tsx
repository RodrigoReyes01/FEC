'use client'

import { ArrowUp, ArrowDown, Repeat, QrCode, LucideIcon } from 'lucide-react'

interface ActionButtonProps {
  icon: string
  label: string
  onClick: () => void
  isDarkMode?: boolean
}

const iconMap: Record<string, LucideIcon> = {
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  'repeat': Repeat,
  'qr-code': QrCode,
}

export default function ActionButton({ icon, label, onClick, isDarkMode = false }: ActionButtonProps) {
  const IconComponent = iconMap[icon] || ArrowUp

  return (
    <div className="flex flex-col items-center">
      <button 
        className="bg-university-red w-16 h-16 rounded-2xl flex items-center justify-center mb-2 hover:bg-university-red-light transition-colors"
        onClick={onClick}
      >
        <IconComponent size={24} color="white" />
      </button>
      <span className="text-university-red text-xs font-medium">{label}</span>
    </div>
  )
}