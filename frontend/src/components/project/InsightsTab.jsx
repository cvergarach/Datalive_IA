'use client'

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';

export default function InsightsTab({ projectId }) {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInsights();
    }, [projectId]);

    const fetchInsights = async () => {
        try {
            const { data } = await api.get(`/api/projects/${projectId}/insights`);
            setInsights(data);
        } catch (error) {
            console.error('Error fetching insights:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'info',
            medium: 'warning',
            high: 'danger',
            critical: 'danger'
        };
        return colors[priority] || 'default';
    };

    const getCategoryIcon = (category) => {
        const icons = {
            trend: '📈',
            pattern: '🔍',
            recommendation: '💡',
            alert: '⚠️'
        };
        return icons[category] || '📊';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" text="Cargando insights..." />
            </div>
        );
    }

    if (insights.length === 0) {
        return (
            <EmptyState
                icon="💡"
                title="No hay insights generados"
                description="Ejecuta las APIs para que la IA genere insights automáticamente"
            />
        );
    }

    return (
        <div className="space-y-4">
            {insights.map((insight) => (
                <Card key={insight.id} hover>
                    <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-4xl">{getCategoryIcon(insight.category)}</span>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{insight.title}</h3>
                                    <p className="text-gray-400 text-sm mt-1">{insight.description}</p>
                                </div>
                            </div>
                            <Badge variant={getPriorityColor(insight.priority)}>
                                {insight.priority}
                            </Badge>
                        </div>

                        {/* Data */}
                        {insight.data && (
                            <div className="p-4 bg-white/5 rounded-lg">
                                <pre className="text-sm text-gray-300 overflow-x-auto">
                                    {JSON.stringify(insight.data, null, 2)}
                                </pre>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-white/10">
                            <span>{insight.category}</span>
                            <span>{new Date(insight.created_at).toLocaleDateString('es-ES')}</span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
