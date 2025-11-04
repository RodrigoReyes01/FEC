'use client'

import Image from 'next/image'

interface LionLogoTransparentProps {
  size?: number
  className?: string
}

export default function LionLogoTransparent({ size = 32, className = "" }: LionLogoTransparentProps) {
  return (
    <Image
      src="/lionlogo-transparent.png"
      alt="University Lion Logo"
      width={size}
      height={size}
      className={`${className}`}
      priority
    />
  )
}