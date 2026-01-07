'use client'

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

const AVAILABLE_MODELS = [
    // Gemini (Google)
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
        id: 'gemini-2.0-pro',
        name: 'Gemini 2.0 Pro',
        provider: 'Google',
        description: 'Mayor razonamiento y precisión',
        icon: '🔷'
    },
    {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'Google',
        description: 'Contexto largo (hasta 2M tokens)',
        icon: '🔷'
    },

    // Claude (Anthropic)
    {
        id: 'claude-4-sonnet-20260115',
        name: 'Claude 4 Sonnet',
        provider: 'Anthropic',
        description: 'Última versión con máxima inteligencia',
        icon: '🟣',
        isNew: true
    },
    {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        description: 'Excelente balance rendimiento/costo',
        icon: '🟣'
    },
    {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        provider: 'Anthropic',
        description: 'Rápido y económico',
        icon: '🟣'
    },
    {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        provider: 'Anthropic',
        description: 'Máxima capacidad de razonamiento',
        icon: '🟣'
    },

    // GPT (OpenAI)
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Modelo multimodal insignia',
        icon: '🟢'
    },
    {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'OpenAI',
        description: 'Optimizado para velocidad',
        icon: '🟢'
    },
    {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        description: 'Ligero y económico',
        icon: '🟢'
    },
    {
        id: 'o1-preview',
        name: 'o1 Preview',
        provider: 'OpenAI',
        description: 'Razonamiento avanzado multi-paso',
        icon: '🟢',
        isNew: true
    },
    {
        id: 'o1-mini',
        name: 'o1 Mini',
        provider: 'OpenAI',
        description: 'Razonamiento eficiente',
        icon: '🟢'
    },

    // Qwen (Alibaba)
    {
        id: 'qwen-2.5-72b-instruct',
        name: 'Qwen 2.5 72B',
        provider: 'Alibaba',
        description: 'Modelo grande multilingüe',
        icon: '🔴'
    },
    {
        id: 'qwen-2.5-32b-instruct',
        name: 'Qwen 2.5 32B',
        provider: 'Alibaba',
        description: 'Balance rendimiento/eficiencia',
        icon: '🔴'
    },
    {
        id: 'qwen-2-72b-instruct',
        name: 'Qwen 2 72B',
        provider: 'Alibaba',
        description: 'Versión estable',
        icon: '🔴'
    }
];

// Agrupar modelos por proveedor
const MODEL_GROUPS = [
    { name: 'Google Gemini', models: AVAILABLE_MODELS.filter(m => m.provider === 'Google') },
    { name: 'Anthropic Claude', models: AVAILABLE_MODELS.filter(m => m.provider === 'Anthropic') },
    { name: 'OpenAI GPT', models: AVAILABLE_MODELS.filter(m => m.provider === 'OpenAI') },
    { name: 'Alibaba Qwen', models: AVAILABLE_MODELS.filter(m => m.provider === 'Alibaba') }
];

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
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
            toast.success('Modelo guardado: ' + AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name);
        } catch (error) {
            toast.error('Error al guardar configuración');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" text="Cargando configuración..." />
            </div>
        );
    }

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
            <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Usuario</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Rol</label>
                        <div className="mt-1">
                            <Badge variant={user?.role === 'admin' ? 'primary' : 'default'}>
                                {user?.role}
                            </Badge>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Model Selection */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Modelo de IA</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Selecciona el modelo que se usará para análisis de documentos y APIs
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        loading={saving}
                    >
                        Guardar Cambios
                    </Button>
                </div>

                <div className="space-y-6">
                    {MODEL_GROUPS.map((group) => (
                        <div key={group.name}>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                {group.models[0]?.icon} {group.name}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {group.models.map((model) => (
                                    <button
                                        key={model.id}
                                        onClick={() => setSelectedModel(model.id)}
                                        className={`
                                            p-3 rounded-lg border-2 transition-all text-left
                                            ${selectedModel === model.id
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900 text-sm">{model.name}</span>
                                                    {model.isDefault && (
                                                        <Badge variant="success" size="sm">Default</Badge>
                                                    )}
                                                    {model.isNew && (
                                                        <Badge variant="info" size="sm">Nuevo</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5 truncate">{model.description}</p>
                                            </div>
                                            <div className={`
                                                w-4 h-4 rounded-full border-2 flex-shrink-0 ml-2
                                                ${selectedModel === model.id
                                                    ? 'border-indigo-600 bg-indigo-600'
                                                    : 'border-gray-300'
                                                }
                                            `}>
                                                {selectedModel === model.id && (
                                                    <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 12 12">
                                                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Sobre los Modelos</h4>
                        <p className="text-sm text-blue-700">
                            Cada proveedor requiere su propia API key configurada en el servidor.
                            Si un modelo falla, el sistema usará Gemini 2.5 Flash como fallback.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
