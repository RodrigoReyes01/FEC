import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '../contexts/ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'
import AppWrapper from '../components/AppWrapper'

export const metadata: Metadata = {
  title: 'MoWa - Mobile Wallet',
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
          <AuthProvider>
            <AppWrapper>
              <div className="min-h-screen bg-white">
                {children}
              </div>
            </AppWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}