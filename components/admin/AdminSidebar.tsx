'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Coins, Users, Building2, Settings, LogOut } from 'lucide-react'
import LionLogoTransparent from '../../app/components/LionLogoTransparent'

const menuItems = [
    { icon: LayoutDashboard, label: 'Resumen', href: '/admin' },
    { icon: Coins, label: 'Emisión (Mint)', href: '/admin/mint' },
    { icon: Users, label: 'Usuarios', href: '/admin/users' },
    { icon: Building2, label: 'Tesorería', href: '/admin/treasury' },
]

export default function AdminSidebar() {
    const pathname = usePathname()

    return (
        <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col border-r border-gray-800">
            <div className="p-6 flex items-center gap-3 border-b border-gray-800">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <LionLogoTransparent size={30} />
                </div>
                <div>
                    <h1 className="font-bold text-lg">Panel UFM</h1>
                    <p className="text-xs text-gray-400">Administración</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-university-red text-white shadow-lg shadow-university-red/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all">
                    <LogOut size={20} />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    )
}
