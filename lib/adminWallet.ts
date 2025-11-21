import { ethers } from 'ethers'
import TokenABI from './contracts/TokenABI.json'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS
const PRIVATE_KEY = process.env.ADMIN_WALLET_PRIVATE_KEY
const RPC_URL = 'https://rpc.sepolia.org' // Or use an Infura/Alchemy key if available in env

if (!CONTRACT_ADDRESS) {
    console.warn('NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS is not set')
}

if (!PRIVATE_KEY) {
    console.warn('ADMIN_WALLET_PRIVATE_KEY is not set')
}

export const getAdminWallet = () => {
    if (!PRIVATE_KEY) throw new Error('ADMIN_WALLET_PRIVATE_KEY not configured')

    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
    return wallet
}

export const getAdminContract = () => {
    if (!CONTRACT_ADDRESS) throw new Error('NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS not configured')

    const wallet = getAdminWallet()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, TokenABI, wallet)
    return contract
}
