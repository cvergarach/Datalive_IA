import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor para agregar token
api.interceptors.request.use((config) => {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
        const { state } = JSON.parse(authStorage)
        if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`
        }
    }
    return config
})

// Interceptor para manejar errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('auth-storage')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api
