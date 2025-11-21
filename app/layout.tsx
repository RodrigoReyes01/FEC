import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '../contexts/ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'
import AppWrapper from '../components/AppWrapper'
import PWA from '../components/PWA'
import { WalletProvider } from '../contexts/WalletContext'

export const metadata: Metadata = {
  title: 'MoWa - Mobile Wallet',
  description: 'A custom crypto wallet for university use',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MoWa'
  },
  icons: {
    icon: [
      { url: '/Logo192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/Logo384x384.png', sizes: '384x384', type: 'image/png' },
      { url: '/Logo512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/Logo192x192.png' }
    ]
  }
}

export const viewport = {
  themeColor: '#722F37',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#722F37" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/Logo192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-white">
        <ThemeProvider>
          <AuthProvider>
            <WalletProvider>
              <AppWrapper>
                <div className="min-h-screen bg-white">
                  {children}
                </div>
              </AppWrapper>
            </WalletProvider>
          </AuthProvider>
        </ThemeProvider>
        <PWA />
      </body>
    </html>
  )
}