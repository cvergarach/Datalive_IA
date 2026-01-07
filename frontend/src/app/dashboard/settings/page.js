'use client'

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';

const AVAILABLE_MODELS = [
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        provider: 'Google',
        description: 'Modelo rápido y eficiente (Recomendado)',
        icon: '🔷',
        isDefault: true
    },
    {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash',
        provider: 'Google',
        description: 'Versión experimental con nuevas capacidades',
        icon: '🔷'
    },
    {
        id: 'claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        description: 'Excelente para análisis complejos',
        icon: '🟣'
    },
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Modelo multimodal avanzado',
        icon: '🟢'
    },
    {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'OpenAI',
        description: 'Versión optimizada de GPT-4',
        icon: '🟢'
    }
];

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/models/preferences');
            if (data && data.default_model) {
                setSelectedModel(data.default_model);
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/api/models/preferences', {
                default_model: selectedModel
            });
            toast.success('Configuración guardada exitosamente');
        } catch (error) {
            toast.error('Error al guardar configuración');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                <p className="text-gray-600 mt-1">
                    Personaliza tu experiencia en DataLIVE
                </p>
            </div>

            {/* User Info */}
            <div className="corporate-card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Usuario</h2>
                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Nombre</label>
                        <p className="text-gray-900 mt-1">{user?.full_name}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900 mt-1">{user?.email}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Rol</label>
                        <div className="mt-1">
                            <Badge variant={user?.role === 'admin' ? 'primary' : 'default'}>
                                {user?.role}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Model Selection */}
            <div className="corporate-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Modelo de IA</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Selecciona el modelo de IA que se usará en toda la aplicación
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        loading={saving}
                        disabled={loading}
                    >
                        Guardar Cambios
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {AVAILABLE_MODELS.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => setSelectedModel(model.id)}
                                className={`
                                    p-4 rounded-lg border-2 transition-all text-left
                                    ${selectedModel === model.id
                                        ? 'border-indigo-600 bg-indigo-50'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }
                                `}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className={`
                                            w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                                            ${selectedModel === model.id ? 'bg-indigo-100' : 'bg-gray-100'}
                                        `}>
                                            {model.icon}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900">{model.name}</h3>
                                            {model.isDefault && (
                                                <Badge variant="success" size="sm">Por defecto</Badge>
                                            )}
                                            {selectedModel === model.id && (
                                                <Badge variant="primary" size="sm">Seleccionado</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">{model.description}</p>
                                        <p className="text-xs text-gray-500">Proveedor: {model.provider}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <div className={`
                                            w-5 h-5 rounded-full border-2 flex items-center justify-center
                                            ${selectedModel === model.id
                                                ? 'border-indigo-600 bg-indigo-600'
                                                : 'border-gray-300'
                                            }
                                        `}>
                                            {selectedModel === model.id && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                                                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Información</h4>
                        <p className="text-sm text-blue-700">
                            El modelo seleccionado se utilizará para todas las operaciones de IA en la aplicación,
                            incluyendo análisis de documentos, descubrimiento de APIs y generación de insights.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
