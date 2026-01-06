'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function DashboardPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirigir automáticamente a proyectos
        router.push('/dashboard/projects')
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner size="lg" text="Cargando..." />
        </div>
    )
}

