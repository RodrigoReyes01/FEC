interface CoinLogoProps {
  size?: number
}

export default function CoinLogo({ size = 40 }: CoinLogoProps) {
  return (
    <div 
      className="rounded-full overflow-hidden flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <img 
        src="/coin-logo.png" 
        alt="Coin Logo" 
        className="w-full h-full object-cover"
      />
    </div>
  )
}
