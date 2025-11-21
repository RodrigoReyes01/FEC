import { ethers } from 'ethers'
import TokenABI from './contracts/TokenABI.json'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS
const PRIVATE_KEY = process.env.ADMIN_WALLET_PRIVATE_KEY
const RPC_URL = process.env.SEPOLIA_RPC_URL
const RPC_URL2 = process.env.SEPOLIA_RPC_URL2
const RPC_URLS_ENV = process.env.SEPOLIA_RPC_URLS

const SEPOLIA_NETWORK = 'sepolia'

if (!CONTRACT_ADDRESS) {
    console.warn('NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS is not set')
}

if (!PRIVATE_KEY) {
    console.warn('ADMIN_WALLET_PRIVATE_KEY is not set')
}

function buildProvider(): ethers.JsonRpcProvider | ethers.FallbackProvider {
    // Collect all available URLs
    const urls = [
        RPC_URL,
        RPC_URL2,
        ...(RPC_URLS_ENV || '').split(',')
    ]
        .map(s => s?.trim())
        .filter((s): s is string => !!s && s.length > 0)

    // Default to public RPC if no keys provided
    if (urls.length === 0) {
        urls.push('https://rpc.sepolia.org')
    }

    // If multiple URLs provided, build a FallbackProvider
    if (urls.length > 1) {
        const providers = urls.map((url, index) => {
            const provider = new ethers.JsonRpcProvider(url, SEPOLIA_NETWORK)
            // Add a small priority difference to prefer the first one but allow fallback
            return {
                provider,
                priority: 1,
                weight: 1,
                stallTimeout: 2000 // Wait 2s before trying next provider if stalled
            }
        })
        // In ethers v6, second arg is network, not quorum. Quorum defaults to 1.
        return new ethers.FallbackProvider(providers, SEPOLIA_NETWORK)
    }

    return new ethers.JsonRpcProvider(urls[0], SEPOLIA_NETWORK)
}

export const getAdminWallet = () => {
    if (!PRIVATE_KEY) throw new Error('ADMIN_WALLET_PRIVATE_KEY not configured')

    // Static network + fallback across multiple RPCs (if provided)
    const provider = buildProvider()
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
    return wallet
}

export const getAdminContract = () => {
    if (!CONTRACT_ADDRESS) throw new Error('NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS not configured')

    const wallet = getAdminWallet()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, TokenABI, wallet)
    return contract
}
