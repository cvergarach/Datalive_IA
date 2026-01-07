'use client'

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';

export default function DocumentsTab({ projectId }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [url, setUrl] = useState('');
    const [addingUrl, setAddingUrl] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, [projectId]);

    const fetchDocuments = async () => {
        try {
            const { data } = await api.get(`/api/documents?projectId=${projectId}`);
            setDocuments(data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setDragActive(false);

        const file = e.dataTransfer?.files[0];
        if (!file) return;

        await uploadFile(file);
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        await uploadFile(file);
    };

    const uploadFile = async (file) => {
        if (file.type !== 'application/pdf') {
            toast.error('Solo se permiten archivos PDF');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);

        try {
            const { data } = await api.post('/api/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Documento subido exitosamente');
            setDocuments([data, ...documents]);
        } catch (error) {
            // Error manejado por interceptor
        } finally {
            setUploading(false);
        }
    };

    const handleAddUrl = async (e) => {
        e.preventDefault();
        if (!url.trim()) return;

        setAddingUrl(true);
        try {
            const { data } = await api.post('/api/documents/url', {
                projectId,
                url: url.trim()
            });
            toast.success('URL agregada exitosamente');
            setDocuments([data, ...documents]);
            setUrl('');
        } catch (error) {
            // Error manejado por interceptor
        } finally {
            setAddingUrl(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            analyzing: 'info',
            completed: 'success',
            failed: 'danger'
        };
        const labels = {
            pending: 'Pendiente',
            analyzing: 'Analizando',
            completed: 'Completado',
            failed: 'Error'
        };
        return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" text="Cargando documentos..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PDF Upload */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Subir PDF</h3>
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                        className={`
                            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                            ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}
                            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                            disabled={uploading}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            {uploading ? (
                                <LoadingSpinner size="md" text="Subiendo..." />
                            ) : (
                                <>
                                    <div className="text-5xl mb-3">📄</div>
                                    <p className="text-gray-900 font-medium mb-1">
                                        {dragActive ? 'Suelta el archivo aquí' : 'Arrastra un PDF aquí'}
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        o haz click para seleccionar
                                    </p>
                                </>
                            )}
                        </label>
                    </div>
                </Card>

                {/* URL Input */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar URL</h3>
                    <form onSubmit={handleAddUrl} className="space-y-4">
                        <Input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://docs.example.com/api"
                            disabled={addingUrl}
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            }
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            loading={addingUrl}
                            disabled={!url.trim() || addingUrl}
                            className="w-full"
                        >
                            Agregar URL
                        </Button>
                    </form>
                </Card>
            </div>

            {/* Documents List */}
            {documents.length === 0 ? (
                <EmptyState
                    icon="📄"
                    title="No hay documentos"
                    description="Sube un PDF o agrega una URL para comenzar el análisis"
                />
            ) : (
                <div className="space-y-3">
                    {documents.map((doc) => (
                        <Card key={doc.id} hover>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="text-3xl">
                                        {doc.type === 'pdf' ? '📄' : '🔗'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-gray-900 font-medium truncate">{doc.name}</h4>
                                        <p className="text-gray-500 text-sm truncate">
                                            {doc.type === 'pdf' ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : doc.url}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(doc.status)}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
