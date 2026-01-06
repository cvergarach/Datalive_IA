/** @type {import('next').NextConfig} */
const nextConfig = {
    // Deshabilitar static optimization para páginas con localStorage
    experimental: {
        optimizePackageImports: ['zustand']
    },
    // Configuración de output
    output: 'standalone',
    // Ignorar errores de build de TypeScript y ESLint temporalmente
    typescript: {
        ignoreBuildErrors: true
    },
    eslint: {
        ignoreDuringBuilds: true
    }
}

module.exports = nextConfig
