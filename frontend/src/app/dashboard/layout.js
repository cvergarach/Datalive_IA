'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function DashboardLayout({ children }) {
    const router = useRouter()
    const { token, user, logout } = useAuthStore()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => {
        if (!token) {
            router.push('/login')
        }
    }, [token, router])

    const handleLogout = () => {
        logout()
        toast.success('Sesión cerrada')
        router.push('/login')
    }

    if (!token) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 h-full glass border-r border-white/10 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} z-50`}>
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        {sidebarOpen ? 'DataLIVE' : 'DL'}
                    </h1>
                </div>

                <nav className="mt-6">
                    <NavItem href="/dashboard" icon="📊" label="Dashboard" open={sidebarOpen} />
                    <NavItem href="/dashboard/projects" icon="📁" label="Proyectos" open={sidebarOpen} />
                    <NavItem href="/dashboard/logs" icon="📝" label="Logs" open={sidebarOpen} />
                    <NavItem href="/dashboard/settings" icon="⚙️" label="Configuración" open={sidebarOpen} />
                    {user?.role === 'admin' && (
                        <NavItem href="/dashboard/admin" icon="👥" label="Administración" open={sidebarOpen} />
                    )}
                </nav>

                <div className="absolute bottom-6 left-0 right-0 px-4">
                    <button
                        onClick={handleLogout}
                        className="w-full py-2 px-4 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                    >
                        {sidebarOpen ? 'Cerrar Sesión' : '🚪'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}

function NavItem({ href, icon, label, open }) {
    const router = useRouter()

    return (
        <button
            onClick={() => router.push(href)}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
        >
            <span className="text-2xl">{icon}</span>
            {open && <span className="text-gray-300">{label}</span>}
        </button>
    )
}
