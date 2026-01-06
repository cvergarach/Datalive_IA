'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
    const router = useRouter()

    useEffect(() => {
        // Verificar token en localStorage solo en el cliente
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null

        if (token) {
            router.push('/dashboard')
        } else {
            router.push('/login')
        }
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">Cargando DataLIVE...</p>
            </div>
        </div>
    )
}
