'use client'

import Image from 'next/image'

interface LionLogoProps {
  size?: number
  className?: string
}

export default function LionLogo({ size = 32, className = "" }: LionLogoProps) {
  return (
    <Image
      src="/lionlogo.png"
      alt="University Lion Logo"
      width={size}
      height={size}
      className={`${className}`}
      priority
    />
  )
}