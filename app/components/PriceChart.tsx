'use client'

import { useState } from 'react'

interface PriceChartProps {
  currentPrice: string
  isLoading?: boolean
  isDarkMode?: boolean
}

export default function PriceChart({ currentPrice, isLoading = false, isDarkMode = false }: PriceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('1D')
  const periods = ['1D', '1W', '1M']

  return (
    <div className={`mx-5 mt-5 p-5 rounded-3xl border-2 border-university-red transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <span className={`text-base font-medium transition-colors duration-300 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>Current Price</span>
        <div className={`flex rounded-lg p-0.5 transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          {periods.map((period) => (
            <button
              key={period}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-university-red text-white'
                  : isDarkMode 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center mb-5">
          <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${
            isDarkMode ? 'border-gray-300' : 'border-gray-600'
          }`}></div>
          <span className={`text-base ml-2 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Cargando precio...</span>
        </div>
      ) : (
        <h2 className={`text-2xl font-bold mb-5 transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>{currentPrice}</h2>
      )}
      
      {/* Placeholder for chart */}
      <div className="h-24 flex items-center justify-center relative">
        <div className="absolute bottom-5 left-0 right-0 h-0.5 bg-university-red"></div>
        <p className={`text-sm italic transition-colors duration-300 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>Chart visualization will go here</p>
      </div>
    </div>
  )
}