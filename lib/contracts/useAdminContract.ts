import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import TokenABI from './TokenABI.json'

// Add type definition for window.ethereum
declare global {
    interface Window {
        ethereum?: any
    }
}

// TODO: Replace with actual contract address
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || ''

export function useAdminContract() {
    const [contract, setContract] = useState<ethers.Contract | null>(null)
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
    const [address, setAddress] = useState<string>('')
    const [isOwner, setIsOwner] = useState(false)
    const [loading, setLoading] = useState(true)

    const connectWallet = useCallback(async () => {
        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' })
                const provider = new ethers.BrowserProvider(window.ethereum)
                const signer = await provider.getSigner()
                const address = await signer.getAddress()

                setSigner(signer)
                setAddress(address)

                if (CONTRACT_ADDRESS) {
                    const contract = new ethers.Contract(CONTRACT_ADDRESS, TokenABI, signer)
                    setContract(contract)

                    // Check if connected wallet is owner
                    try {
                        const owner = await contract.owner()
                        setIsOwner(owner.toLowerCase() === address.toLowerCase())
                    } catch (e) {
                        console.error('Error checking owner:', e)
                    }
                }
            } catch (error) {
                console.error('Error connecting wallet:', error)
            } finally {
                setLoading(false)
            }
        } else {
            setLoading(false)
            alert('Please install MetaMask!')
        }
    }, [])

    useEffect(() => {
        connectWallet()
    }, [connectWallet])

    return {
        contract,
        signer,
        address,
        isOwner,
        loading,
        connectWallet
    }
}
