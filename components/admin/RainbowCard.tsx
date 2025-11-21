import React from 'react'

interface RainbowCardProps {
    children: React.ReactNode
    className?: string
    isDarkMode?: boolean
}

export default function RainbowCard({
    children,
    className = '',
    isDarkMode = false
}: RainbowCardProps) {
    return (
        <div className={`rainbow-glow-border rounded-3xl p-1 ${className}`}>
            <div className={`h-full w-full rounded-[20px] p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                {children}
            </div>
        </div>
    )
}
