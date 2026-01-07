'use client'

import { useState, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import ProjectCard from '@/components/projects/ProjectCard';
import { toast } from 'react-hot-toast';

export default function ProjectsPage() {
    const { projects, loading, fetchProjects, deleteProject } = useProjectStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleDeleteProject = async (id, name) => {
        if (confirm(`¿Estás seguro de eliminar el proyecto "${name}"?`)) {
            try {
                await deleteProject(id);
                toast.success('Proyecto eliminado exitosamente');
            } catch (error) {
                // Error ya manejado por el interceptor
            }
        }
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
                    <p className="text-gray-600 mt-1">
                        Gestiona tus proyectos de análisis de APIs
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    variant="primary"
                    icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    }
                >
                    Nuevo Proyecto
                </Button>
            </div>

            {/* Search */}
            {projects.length > 0 && (
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar proyectos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2.5 pl-10 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <LoadingSpinner size="lg" text="Cargando proyectos..." />
                </div>
            ) : filteredProjects.length === 0 ? (
                searchTerm ? (
                    <EmptyState
                        icon="🔍"
                        title="No se encontraron proyectos"
                        description={`No hay proyectos que coincidan con "${searchTerm}"`}
                    />
                ) : (
                    <EmptyState
                        icon="📁"
                        title="No tienes proyectos"
                        description="Crea tu primer proyecto para comenzar a analizar APIs"
                        action={() => setIsCreateModalOpen(true)}
                        actionLabel="Crear Proyecto"
                    />
                )
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onDelete={() => handleDeleteProject(project.id, project.name)}
                        />
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
