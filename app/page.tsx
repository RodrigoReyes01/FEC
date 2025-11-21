'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, ChevronRight, Sun, Moon } from 'lucide-react'
import ActionButton from './components/ActionButton'
import BalanceCard from './components/BalanceCard'
import PriceChart from './components/PriceChart'
import LionLogoTransparent from './components/LionLogoTransparent'
import RainbowButton from './components/RainbowButton'
import Header, { MenuButton } from '../components/CurvedMenu'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'

export default function WalletScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [isMenuActive, setIsMenuActive] = useState(false)

  // Estado para datos de la billetera - listo para conectar con backend
  const [walletData, setWalletData] = useState({
    balance: '0.0000',
    usdValue: '$0.00',
    change: '+$0.00',
    changePercent: '+0.00%',
    currency: 'UNI',
    currentPrice: '$0.00',
    isLoading: true
  })

  // Función para obtener datos del backend
  const fetchWalletData = async () => {
    try {
      setWalletData(prev => ({ ...prev, isLoading: true }))

      // Por ahora usar datos de ejemplo hasta conectar el backend real
      // TODO: Descomentar cuando tengas el backend listo
      // const walletAddress = 'USER_WALLET_ADDRESS';
      // const data = await getWalletBalance(walletAddress);
      // setWalletData(data);

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Datos de ejemplo
      const mockData = {
        balance: '2.4856',
        usdValue: '$110,789.45',
        change: '+$3,245.67',
        changePercent: '+3.02%',
        currency: 'UNI',
        currentPrice: '$44,567.23',
        isLoading: false
      }

      setWalletData(mockData)
    } catch (error) {
      console.error('Error fetching wallet data:', error)
      setWalletData(prev => ({ ...prev, isLoading: false }))
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchWalletData()
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
      {/* Curved Menu */}
      <Header
        isActive={isMenuActive}
        setIsActive={setIsMenuActive}
      />

      {/* Header */}
      <div className="bg-university-red px-5 py-4">
        <div className="flex items-center">
          <div className="flex-1 flex justify-start">
            <MenuButton
              isActive={isMenuActive}
              onClick={() => setIsMenuActive(!isMenuActive)}
            />
          </div>
          <div className="flex justify-center">
            <LionLogoTransparent size={40} />
          </div>
          <div className="flex-1 flex justify-end items-center space-x-2">
            <button
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? <Sun size={20} color="white" /> : <Moon size={20} color="white" />}
            </button>
            <button className="p-2">
              <Bell size={24} color="white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`pb-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
        {/* Welcome Section */}
        <div className="px-5 pt-6 pb-2">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Hola, {user?.user_metadata?.first_name || 'Estudiante'} {user?.user_metadata?.last_name || ''}
          </h1>
          <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Carnet: {user?.user_metadata?.university_id || '----'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-around px-5 py-5">
          <ActionButton
            icon="arrow-up"
            label="Send"
            onClick={() => router.push('/send')}
            isDarkMode={isDarkMode}
          />
          <ActionButton
            icon="arrow-down"
            label="Receive"
            onClick={() => router.push('/receive')}
            isDarkMode={isDarkMode}
          />
          <ActionButton
            icon="shopping-cart"
            label="Buy"
            onClick={() => console.log('Buy')}
            isDarkMode={isDarkMode}
          />
          <ActionButton
            icon="qr-code"
            label="Scan"
            onClick={() => router.push('/scan')}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Balance Card */}
        <BalanceCard
          balance={walletData.balance}
          usdValue={walletData.usdValue}
          change={walletData.change}
          changePercent={walletData.changePercent}
          currency={walletData.currency}
          isLoading={walletData.isLoading}
          onRefresh={fetchWalletData}
          userInitial="R"
          isDarkMode={isDarkMode}
        />

        {/* Price Chart */}
        <PriceChart
          currentPrice={walletData.currentPrice}
          isLoading={walletData.isLoading}
          isDarkMode={isDarkMode}
        />

        {/* Recent Activity Button */}
        <RainbowButton
          onClick={() => router.push('/history')}
          isDarkMode={isDarkMode}
          className="flex justify-between items-center mx-5 mt-5 p-4 rounded-xl"
        >
          <span className={`text-base font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>View Recent Activity</span>
          <ChevronRight size={20} color="#722F37" />
        </RainbowButton>
      </div>
    </div>
  )
}