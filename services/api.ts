// Configuración de API para conectar con el backend
const API_CONFIG = {
    BASE_URL: 'https://your-backend-api.com/api', // Cambiar por tu URL del backend
    ENDPOINTS: {
        WALLET_BALANCE: '/wallet/balance',
        WALLET_TRANSACTIONS: '/wallet/transactions',
        TOKEN_PRICE: '/token/price',
        SEND_TRANSACTION: '/wallet/send',
        RECEIVE_ADDRESS: '/wallet/receive',
    },
    HEADERS: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer YOUR_TOKEN', // Agregar cuando tengas autenticación
    }
}

// Servicio para obtener balance de la billetera
export const getWalletBalance = async (walletAddress: string) => {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WALLET_BALANCE}`, {
            method: 'GET',
            headers: {
                ...API_CONFIG.HEADERS,
                // Agregar wallet address en headers o como query param
            },
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Formatear datos para el frontend
        return {
            balance: data.balance || '0.0000',
            usdValue: `$${data.usdValue || '0.00'}`,
            change: data.change24h >= 0 ? `+$${data.change24h}` : `-$${Math.abs(data.change24h)}`,
            changePercent: data.changePercent24h >= 0 ? `+${data.changePercent24h}%` : `${data.changePercent24h}%`,
            currency: data.tokenSymbol || 'UNI',
            currentPrice: `$${data.currentPrice || '0.00'}`,
            isLoading: false
        }
    } catch (error) {
        console.error('Error fetching wallet balance:', error)
        throw error
    }
}

// Servicio para obtener transacciones
export const getWalletTransactions = async (walletAddress: string, limit = 10) => {
    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WALLET_TRANSACTIONS}?limit=${limit}`,
            {
                method: 'GET',
                headers: API_CONFIG.HEADERS,
            }
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Formatear transacciones para el frontend
        return data.transactions?.map((tx: any) => ({
            id: tx.id || tx.hash,
            type: tx.type, // 'sent' o 'received'
            amount: tx.type === 'received' ? `+${tx.amount}` : `-${tx.amount}`,
            usdAmount: tx.type === 'received' ? `+$${tx.usdAmount}` : `-$${tx.usdAmount}`,
            address: tx.fromAddress || tx.toAddress,
            time: formatTransactionTime(tx.timestamp),
            isHighlighted: tx.isHighlighted || false,
        })) || []
    } catch (error) {
        console.error('Error fetching transactions:', error)
        throw error
    }
}

// Servicio para enviar transacción
export const sendTransaction = async (toAddress: string, amount: string, privateKey: string) => {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEND_TRANSACTION}`, {
            method: 'POST',
            headers: API_CONFIG.HEADERS,
            body: JSON.stringify({
                toAddress,
                amount,
                privateKey, // En producción, manejar esto de forma más segura
            }),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error sending transaction:', error)
        throw error
    }
}

// Función auxiliar para formatear tiempo de transacciones
const formatTransactionTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
        return `Today, ${date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })}`
    } else if (diffInHours < 48) {
        return `Yesterday, ${date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })}`
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }
}

export default API_CONFIG