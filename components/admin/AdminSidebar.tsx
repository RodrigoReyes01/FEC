'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Coins, Users, Building2, Info, LogOut } from 'lucide-react'

const menuItems = [
    { icon: LayoutDashboard, label: 'Resumen', href: '/admin' },
    { icon: Coins, label: 'Emisión (Mint)', href: '/admin/mint' },
    { icon: Users, label: 'Usuarios', href: '/admin/users' },
    { icon: Building2, label: 'Tesorería', href: '/admin/treasury' },
    { icon: Info, label: 'Información', href: '/admin/info' },
]

export default function AdminSidebar() {
    const pathname = usePathname()

    return (
        <div className="w-64 bg-[#722F37] text-white h-screen fixed left-0 top-0 flex flex-col border-r border-white/10">
            <div className="p-6 flex items-center gap-3 border-b border-white/10">
                <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden">
                    <Image src="/lionlogo-transparent.png" alt="Lion Logo" width={64} height={64} className="object-contain" />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-tight">Admin Panel<br />UFM</h1>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-4 mt-4">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-200 font-bold ${isActive
                                ? 'bg-white text-black border-2 border-black'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            {/* <Icon size={20} /> */}
                            <span className="text-lg">{item.label === 'Resumen' ? 'Dashboard' : item.label === 'Emisión (Mint)' ? 'Emision' : item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* <div className="p-4 border-t border-white/10">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all">
                    <LogOut size={20} />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div> */}
        </div>
    )
}
