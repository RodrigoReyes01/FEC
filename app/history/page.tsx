'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ArrowUp, ArrowDown } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

interface Transaction {
  id: number
  type: 'sent' | 'received'
  amount: string
  usdAmount: string
  address: string
  time: string
  isHighlighted: boolean
}

export default function TransactionHistoryScreen() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Función para cargar transacciones del backend
  const fetchTransactions = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Datos de ejemplo
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          type: 'received',
          amount: '+0.0125',
          usdAmount: '+$557.09',
          address: 'bc1qxy2...a4f8',
          time: 'Today, 2:30 PM',
          isHighlighted: false,
        },
        {
          id: 2,
          type: 'sent',
          amount: '-0.0543',
          usdAmount: '-$2,420.09',
          address: 'bc1q8f3...b2c1',
          time: 'Yesterday, 10:15 AM',
          isHighlighted: true,
        },
        {
          id: 3,
          type: 'received',
          amount: '+0.1500',
          usdAmount: '+$6,685.09',
          address: 'bc1q9a1...d7e3',
          time: 'Nov 1, 4:22 PM',
          isHighlighted: false,
        },
        {
          id: 4,
          type: 'sent',
          amount: '-0.0250',
          usdAmount: '-$1,114.18',
          address: 'bc1q5d2...c9a6',
          time: 'Oct 31, 8:45 AM',
          isHighlighted: false,
        },
      ]
      
      setTransactions(mockTransactions)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Cargar transacciones al montar el componente
  useEffect(() => {
    fetchTransactions()
  }, [])

  // Función para refrescar transacciones
  const onRefresh = () => {
    fetchTransactions(true)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Header */}
      <div className={`flex justify-between items-center px-5 py-4 border-b transition-colors duration-300 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <button onClick={() => router.back()} className="p-2">
          <ChevronLeft size={24} color={isDarkMode ? '#fff' : '#333'} />
        </button>
        <h1 className={`text-lg font-semibold transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>Recent Activity</h1>
        <button className="text-base text-university-red font-medium">
          View All
        </button>
      </div>

      {/* Transaction List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center pt-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-red"></div>
          <p className={`text-base mt-3 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Cargando transacciones...</p>
        </div>
      ) : (
        <div className="px-5">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                isDarkMode={isDarkMode}
              />
            ))
          ) : (
            <div className="flex items-center justify-center pt-12">
              <p className={`text-base text-center transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>No hay transacciones disponibles</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TransactionItem({ transaction, isDarkMode = false }: { transaction: Transaction, isDarkMode?: boolean }) {
  const isReceived = transaction.type === 'received'
  
  return (
    <button 
      className={`flex items-start w-full p-4 rounded-2xl my-1.5 transition-colors ${
        transaction.isHighlighted 
          ? isDarkMode 
            ? 'bg-gray-800 border-2 border-gray-600' 
            : 'bg-white border-2 border-gray-800'
          : isDarkMode 
            ? 'bg-gray-800 hover:bg-gray-700' 
            : 'bg-gray-50 hover:bg-gray-100'
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mr-3 ${
        isReceived ? 'bg-university-red' : 'bg-black'
      }`}>
        {isReceived ? (
          <ArrowDown size={20} color="white" />
        ) : (
          <ArrowUp size={20} color="white" />
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <span className={`text-base font-semibold transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {isReceived ? 'Received' : 'Sent'}
          </span>
          <div className="text-right">
            <span className={`text-base font-semibold ${
              isReceived ? 'text-green-600' : isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {transaction.amount}
            </span>
            <p className={`text-sm mt-0.5 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>UNI</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>{transaction.address}</span>
          <span className={`text-sm font-medium transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>{transaction.usdAmount}</span>
        </div>
        
        <p className={`text-sm text-left transition-colors duration-300 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>{transaction.time}</p>
      </div>
    </button>
  )
}