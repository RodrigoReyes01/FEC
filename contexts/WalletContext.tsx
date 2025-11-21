'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface WalletContextType {
    walletAddress: string | null
    isLoading: boolean
    refreshWallet: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [walletAddress, setWalletAddress] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const fetchWalletAddress = async () => {
        if (!user?.id) {
            setWalletAddress(null)
            return
        }

        try {
            setIsLoading(true)
            const response = await fetch(`/api/users/profile?userId=${user.id}`)
            if (response.ok) {
                const data = await response.json()
                setWalletAddress(data.walletAddress || null)
            }
        } catch (error) {
            console.error('Error fetching wallet address:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchWalletAddress()
    }, [user?.id])

    return (
        <WalletContext.Provider
            value={{
                walletAddress,
                isLoading,
                refreshWallet: fetchWalletAddress
            }}
        >
            {children}
        </WalletContext.Provider>
    )
}

export function useWallet() {
    const context = useContext(WalletContext)
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider')
    }
    return context
}
