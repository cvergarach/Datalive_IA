'use client'

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function APIsTab({ projectId }) {
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAPIs();
    }, [projectId]);

    const fetchAPIs = async () => {
        try {
            const { data } = await api.get(`/api/projects/${projectId}/apis`);
            setApis(data);
        } catch (error) {
            console.error('Error fetching APIs:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" text="Cargando APIs..." />
            </div>
        );
    }

    if (apis.length === 0) {
        return (
            <EmptyState
                icon="🔌"
                title="No hay APIs descubiertas"
                description="Sube documentación para que la IA descubra las APIs automáticamente"
            />
        );
    }

    return (
        <div className="space-y-6">
            {apis.map((apiItem) => (
                <Card key={apiItem.id}>
                    <div className="space-y-4">
                        {/* API Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-white">{apiItem.name}</h3>
                                <p className="text-gray-400 mt-1">{apiItem.description}</p>
                                <p className="text-purple-400 mt-2 font-mono text-sm">{apiItem.base_url}</p>
                            </div>
                            <Badge variant="primary">{apiItem.auth_type || 'none'}</Badge>
                        </div>

                        {/* Endpoints */}
                        {apiItem.endpoints && apiItem.endpoints.length > 0 && (
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-3">
                                    Endpoints ({apiItem.endpoints.length})
                                </h4>
                                <div className="space-y-2">
                                    {apiItem.endpoints.slice(0, 5).map((endpoint, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                                        >
                                            <Badge
                                                variant={
                                                    endpoint.method === 'GET' ? 'success' :
                                                        endpoint.method === 'POST' ? 'primary' :
                                                            endpoint.method === 'PUT' ? 'warning' :
                                                                endpoint.method === 'DELETE' ? 'danger' : 'default'
                                                }
                                                size="sm"
                                            >
                                                {endpoint.method}
                                            </Badge>
                                            <span className="text-gray-300 font-mono text-sm flex-1">
                                                {endpoint.path}
                                            </span>
                                            <span className="text-gray-500 text-xs">
                                                {endpoint.description}
                                            </span>
                                        </div>
                                    ))}
                                    {apiItem.endpoints.length > 5 && (
                                        <p className="text-gray-500 text-sm text-center py-2">
                                            +{apiItem.endpoints.length - 5} endpoints más
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-white/10">
                            <Button variant="primary" size="sm">
                                Configurar Credenciales
                            </Button>
                            <Button variant="secondary" size="sm">
                                Ver Detalles
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
