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
            <div className="flex items-center justify-center min-h-screen">
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
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        }
                    >
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-4xl font-bold text-white">{currentProject.name}</h1>
                        <p className="text-gray-400 mt-1">{currentProject.description}</p>
                    </div>
                </div>
                <Badge variant="primary">{currentProject.industry}</Badge>
            </div>

            {/* Tabs */}
            <div className="glass rounded-2xl p-2">
                <div className="flex gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex-1 px-4 py-3 rounded-lg font-medium transition-all
                                ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }
                            `}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                {activeTab === 'documents' && <DocumentsTab projectId={currentProject.id} />}
                {activeTab === 'apis' && <APIsTab projectId={currentProject.id} />}
                {activeTab === 'execution' && <ExecutionTab projectId={currentProject.id} />}
                {activeTab === 'insights' && <InsightsTab projectId={currentProject.id} />}
            </div>
        </div>
    );
}
