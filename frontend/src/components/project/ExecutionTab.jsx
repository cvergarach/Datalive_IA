'use client'

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';

export default function ExecutionTab({ projectId }) {
    const [executions, setExecutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);

    useEffect(() => {
        fetchExecutions();
    }, [projectId]);

    const fetchExecutions = async () => {
        try {
            const { data } = await api.get(`/api/execution/history?projectId=${projectId}`);
            setExecutions(data);
        } catch (error) {
            console.error('Error fetching executions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExecuteAll = async () => {
        setExecuting(true);
        try {
            await api.post('/api/execution/execute-all', { projectId });
            toast.success('Ejecución iniciada. Los resultados aparecerán pronto.');
            setTimeout(fetchExecutions, 2000);
        } catch (error) {
            // Error manejado por interceptor
        } finally {
            setExecuting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" text="Cargando ejecuciones..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Ejecución de APIs</h2>
                    <p className="text-gray-400 mt-1">
                        Ejecuta endpoints y obtén insights automáticos
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={handleExecuteAll}
                    loading={executing}
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    }
                >
                    Ejecutar Todos
                </Button>
            </div>

            {/* Executions List */}
            {executions.length === 0 ? (
                <EmptyState
                    icon="⚡"
                    title="No hay ejecuciones"
                    description="Ejecuta los endpoints de tus APIs para obtener datos e insights"
                    action={handleExecuteAll}
                    actionLabel="Ejecutar Ahora"
                />
            ) : (
                <div className="space-y-4">
                    {executions.map((exec) => (
                        <Card key={exec.id}>
                            <div className="space-y-3">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            variant={
                                                exec.method === 'GET' ? 'success' :
                                                    exec.method === 'POST' ? 'primary' :
                                                        exec.method === 'PUT' ? 'warning' :
                                                            'danger'
                                            }
                                        >
                                            {exec.method}
                                        </Badge>
                                        <span className="text-white font-mono">{exec.endpoint}</span>
                                    </div>
                                    <Badge
                                        variant={
                                            exec.status === 'success' ? 'success' :
                                                exec.status === 'failed' ? 'danger' :
                                                    'warning'
                                        }
                                    >
                                        {exec.response_status || exec.status}
                                    </Badge>
                                </div>

                                {/* AI Explanation */}
                                {exec.ai_explanation && (
                                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                        <p className="text-sm text-gray-300">{exec.ai_explanation}</p>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>
                                        {new Date(exec.created_at).toLocaleString('es-ES')}
                                    </span>
                                    {exec.response_time && (
                                        <span>{exec.response_time}ms</span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
