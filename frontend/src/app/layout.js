import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'DataLIVE - Plataforma de Inteligencia de APIs',
    description: 'Descubre, ejecuta y genera insights de APIs con IA',
}

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body className={inter.className}>
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                        },
                    }}
                />
            </body>
        </html>
    )
}
