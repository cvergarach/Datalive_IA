'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function DashboardLayout({ children }) {
    const router = useRouter()
    const pathname = usePathname()
    const { token, user, logout } = useAuthStore()

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

    const navigation = [
        { name: 'Proyectos', href: '/dashboard/projects', icon: '📁' },
        { name: 'Configuración', href: '/dashboard/settings', icon: '⚙️' },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">D</span>
                        </div>
                        <span className="text-xl font-semibold text-gray-900">DataLIVE</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <button
                                key={item.name}
                                onClick={() => router.push(item.href)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                                    sidebar-item
                                    ${isActive ? 'active' : 'text-gray-700'}
                                `}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.name}</span>
                            </button>
                        )
                    })}
                </nav>

                {/* User Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold text-sm">
                                {user?.full_name?.[0] || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.full_name || 'Usuario'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <span>🚪</span>
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-semibold text-gray-900">
                            {navigation.find(item => pathname.startsWith(item.href))?.name || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
