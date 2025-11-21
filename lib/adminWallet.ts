import { ethers } from 'ethers'
import TokenABI from './contracts/TokenABI.json'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS
const PRIVATE_KEY = process.env.ADMIN_WALLET_PRIVATE_KEY
const RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'
const RPC_URLS = (process.env.SEPOLIA_RPC_URLS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
const SEPOLIA_NETWORK = { name: 'sepolia', chainId: 11155111 }

if (!CONTRACT_ADDRESS) {
    console.warn('NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS is not set')
}

if (!PRIVATE_KEY) {
    console.warn('ADMIN_WALLET_PRIVATE_KEY is not set')
}

function buildProvider(): ethers.JsonRpcProvider | ethers.FallbackProvider {
    // If multiple URLs provided, build a FallbackProvider
    const urls = RPC_URLS.length > 0 ? RPC_URLS : [RPC_URL]
    if (urls.length > 1) {
        const providers = urls.map(url => new ethers.JsonRpcProvider(url, SEPOLIA_NETWORK))
        // quorum 1: succeed if any provider returns
        return new ethers.FallbackProvider(providers, 1)
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
