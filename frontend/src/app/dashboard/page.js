'use client'

import { useEffect, useState } from 'react'

export default function DashboardPage() {
    const [user, setUser] = useState(null)
    const [stats, setStats] = useState({
        projects: 0,
        apis: 0,
        executions: 0,
    })

    useEffect(() => {
        // Cargar usuario del localStorage solo en el cliente
        if (typeof window !== 'undefined') {
            const authStorage = localStorage.getItem('auth-storage')
            if (authStorage) {
                const { state } = JSON.parse(authStorage)
                setUser(state.user)
            }
        }
    }, [])

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-white">
                    Bienvenido, {user?.name || 'Usuario'}
                </h1>
                <p className="text-gray-400 mt-2">
                    Panel de control de DataLIVE
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Proyectos"
                    value={stats.projects}
                    icon="📁"
                    color="from-purple-500 to-purple-700"
                />
                <StatCard
                    title="APIs Descubiertas"
                    value={stats.apis}
                    icon="🔌"
                    color="from-blue-500 to-blue-700"
                />
                <StatCard
                    title="Ejecuciones"
                    value={stats.executions}
                    icon="⚡"
                    color="from-green-500 to-green-700"
                />
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Acciones Rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <QuickAction
                        title="Crear Proyecto"
                        description="Inicia un nuevo proyecto de análisis de APIs"
                        icon="➕"
                        href="/dashboard/projects/new"
                    />
                    <QuickAction
                        title="Ver Logs"
                        description="Monitorea la actividad del sistema en tiempo real"
                        icon="📝"
                        href="/dashboard/logs"
                    />
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, color }) {
    return (
        <div className="glass rounded-2xl p-6 hover-lift">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-sm">{title}</p>
                    <p className="text-4xl font-bold text-white mt-2">{value}</p>
                </div>
                <div className={`text-5xl bg-gradient-to-br ${color} p-4 rounded-xl`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}

function QuickAction({ title, description, icon, href }) {
    return (
        <a
            href={href}
            className="glass rounded-xl p-4 hover:bg-white/10 transition-all hover-lift flex items-center gap-4"
        >
            <div className="text-4xl">{icon}</div>
            <div>
                <h3 className="text-white font-semibold">{title}</h3>
                <p className="text-gray-400 text-sm">{description}</p>
            </div>
        </a>
    )
}
