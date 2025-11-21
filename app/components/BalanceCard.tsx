'use client'

import { RefreshCw } from 'lucide-react'
import CoinLogo from './CoinLogo'

interface BalanceCardProps {
  balance: string
  usdValue: string
  change: string
  changePercent: string
  currency: string
  tokenName?: string
  isLoading?: boolean
  onRefresh?: () => void
  userInitial?: string
  userAvatar?: string
  isDarkMode?: boolean
}

export default function BalanceCard({ 
  balance, 
  usdValue, 
  change, 
  changePercent, 
  currency,
  tokenName = 'Token', 
  isLoading = false,
  onRefresh,
  userInitial = 'R',
  userAvatar,
  isDarkMode = false
}: BalanceCardProps) {
  // Determinar si el cambio es positivo o negativo
  const isPositiveChange = change && change.startsWith('+')
  
  if (isLoading) {
    return (
      <div className="bg-university-red mx-5 mt-5 p-5 rounded-3xl">
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="text-white text-base ml-3">Cargando balance...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-university-red mx-5 mt-5 p-5 rounded-3xl">
      <div className="flex items-center mb-4">
        <div className="mr-4">
          <CoinLogo size={60} />
        </div>
        <div className="flex-1">
          <h3 className="text-white text-base font-medium">Balance Total</h3>
          <p className="text-white/80 text-sm">{tokenName}</p>
        </div>
        {onRefresh && (
          <button onClick={onRefresh} className="p-2">
            <RefreshCw size={20} color="white" />
          </button>
        )}
      </div>
      
      <div className="flex justify-between items-baseline mb-4">
        <span className="text-white text-3xl font-bold">{balance} {currency}</span>
      </div>
      
      <div className="bg-black/20 p-3 rounded-xl flex items-center">
        <span className={`text-base font-semibold mr-2 ${
          isPositiveChange ? 'text-green-400' : 'text-red-400'
        }`}>
          {change}
        </span>
        <span className={`text-base font-semibold mr-2 ${
          isPositiveChange ? 'text-green-400' : 'text-red-400'
        }`}>
          {changePercent}
        </span>
        <span className="text-white/80 text-sm">hoy</span>
      </div>
    </div>
  )
}