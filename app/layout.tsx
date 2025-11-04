import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '../contexts/ThemeContext'

export const metadata: Metadata = {
  title: 'University Crypto Wallet',
  description: 'A custom crypto wallet for university use',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white">
        <ThemeProvider>
          <div className="min-h-screen bg-white">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}