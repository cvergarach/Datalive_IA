'use client'

import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function ProjectCard({ project, onDelete }) {
    const router = useRouter();

    const industryIcons = {
        fintech: '💳',
        telco: '📡',
        mining: '⛏️',
        banking: '🏦',
        ecommerce: '🛒',
        meta: '💬',
        'public-market': '🏛️',
        other: '📊'
    };

    const industryLabels = {
        fintech: 'Fintech',
        telco: 'Telecomunicaciones',
        mining: 'Minería',
        banking: 'Banca',
        ecommerce: 'eCommerce',
        meta: 'Meta/WhatsApp',
        'public-market': 'Mercado Público',
        other: 'Otro'
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Card hover onClick={() => router.push(`/dashboard/projects/${project.id}`)}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">
                            {industryIcons[project.industry] || '📊'}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {project.name}
                            </h3>
                            <Badge variant="primary" size="sm">
                                {industryLabels[project.industry] || 'Otro'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-2">
                    {project.description || 'Sin descripción'}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                        <div className="text-xl font-bold text-indigo-600">
                            {project._count?.documents || 0}
                        </div>
                        <div className="text-xs text-gray-500">Documentos</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">
                            {project._count?.apis || 0}
                        </div>
                        <div className="text-xs text-gray-500">APIs</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-green-600">
                            {project._count?.executions || 0}
                        </div>
                        <div className="text-xs text-gray-500">Ejecuciones</div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                        Creado {formatDate(project.created_at)}
                    </span>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                        >
                            Ver
                        </Button>
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={onDelete}
                        >
                            Eliminar
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
