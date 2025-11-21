interface StatCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon?: React.ReactNode
    loading?: boolean
}

export default function StatCard({ title, value, subtitle, icon, loading }: StatCardProps) {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">{value}</span>
                        {subtitle && <span className="text-sm text-gray-500">{subtitle}</span>}
                    </div>
                </div>
                {icon && (
                    <div className="p-3 bg-gray-50 rounded-xl text-university-red">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    )
}
