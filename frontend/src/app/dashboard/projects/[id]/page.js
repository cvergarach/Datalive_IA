'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/projectStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DocumentsTab from '@/components/project/DocumentsTab';
import APIsTab from '@/components/project/APIsTab';
import ExecutionTab from '@/components/project/ExecutionTab';
import InsightsTab from '@/components/project/InsightsTab';

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { currentProject, fetchProject, loading } = useProjectStore();
    const [activeTab, setActiveTab] = useState('documents');

    useEffect(() => {
        if (params.id) {
            fetchProject(params.id);
        }
    }, [params.id, fetchProject]);

    if (loading || !currentProject) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" text="Cargando proyecto..." />
            </div>
        );
    }

    const tabs = [
        { id: 'documents', label: 'Documentos', icon: '📄' },
        { id: 'apis', label: 'APIs', icon: '🔌' },
        { id: 'execution', label: 'Ejecución', icon: '⚡' },
        { id: 'insights', label: 'Insights', icon: '💡' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/dashboard/projects')}
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        }
                    >
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{currentProject.name}</h1>
                        <p className="text-gray-600 text-sm mt-1">{currentProject.description}</p>
                    </div>
                </div>
                <Badge variant="primary">{currentProject.industry}</Badge>
            </div>

            {/* Tabs */}
            <div className="bg-white border border-gray-200 rounded-lg p-1 inline-flex gap-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            px-4 py-2 rounded-md text-sm font-medium transition-all
                            ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }
                        `}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'documents' && <DocumentsTab projectId={currentProject.id} />}
                {activeTab === 'apis' && <APIsTab projectId={currentProject.id} />}
                {activeTab === 'execution' && <ExecutionTab projectId={currentProject.id} />}
                {activeTab === 'insights' && <InsightsTab projectId={currentProject.id} />}
            </div>
        </div>
    );
}
