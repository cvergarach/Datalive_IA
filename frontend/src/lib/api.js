// Cliente API configurado con Axios
import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
                const { state } = JSON.parse(authStorage);
                if (state.token) {
                    config.headers.Authorization = `Bearer ${state.token}`;
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Error de respuesta del servidor
            const message = error.response.data?.error || error.response.data?.message || 'Error en la petición';

            if (error.response.status === 401) {
                // Token inválido o expirado
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth-storage');
                    window.location.href = '/login';
                }
                toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
            } else if (error.response.status === 403) {
                toast.error('No tienes permisos para realizar esta acción');
            } else if (error.response.status === 404) {
                toast.error('Recurso no encontrado');
            } else if (error.response.status >= 500) {
                toast.error('Error del servidor. Por favor intenta más tarde.');
            } else {
                toast.error(message);
            }
        } else if (error.request) {
            // Error de red
            toast.error('Error de conexión. Verifica tu internet.');
        } else {
            toast.error('Error inesperado');
        }

        return Promise.reject(error);
    }
);

export default api;
