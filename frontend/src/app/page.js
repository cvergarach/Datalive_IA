'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function Home() {
    const router = useRouter()
    const { token } = useAuthStore()

    useEffect(() => {
        if (token) {
            router.push('/dashboard')
        } else {
            router.push('/login')
        }
    }, [token, router])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">Cargando...</p>
            </div>
        </div>
    )
}
