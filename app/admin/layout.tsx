'use client'

import AdminSidebar from '../../components/admin/AdminSidebar'
import { useTheme } from '../../contexts/ThemeContext'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isDarkMode } = useTheme()

    return (
        <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <AdminSidebar />
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    )
}
