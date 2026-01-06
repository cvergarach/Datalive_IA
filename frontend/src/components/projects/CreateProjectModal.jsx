'use client'

import { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

export default function CreateProjectModal({ isOpen, onClose }) {
    const { createProject } = useProjectStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        industry: 'other'
    });

    const industries = [
        { value: 'fintech', label: '💳 Fintech' },
        { value: 'telco', label: '📡 Telecomunicaciones' },
        { value: 'mining', label: '⛏️ Minería' },
        { value: 'banking', label: '🏦 Banca' },
        { value: 'ecommerce', label: '🛒 eCommerce' },
        { value: 'meta', label: '💬 Meta/WhatsApp' },
        { value: 'public-market', label: '🏛️ Mercado Público' },
        { value: 'other', label: '📊 Otro' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createProject(formData);
            toast.success('Proyecto creado exitosamente');
            setFormData({ name: '', description: '', industry: 'other' });
            onClose();
        } catch (error) {
            // Error ya manejado por el interceptor
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setFormData({ name: '', description: '', industry: 'other' });
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Crear Nuevo Proyecto"
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={!formData.name.trim()}
                    >
                        Crear Proyecto
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nombre del Proyecto"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Análisis API de Pagos"
                    required
                    disabled={loading}
                />

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-300">
                        Descripción
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe brevemente el proyecto..."
                        rows={3}
                        disabled={loading}
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-300">
                        Industria
                    </label>
                    <select
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        disabled={loading}
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {industries.map((industry) => (
                            <option key={industry.value} value={industry.value} className="bg-gray-800">
                                {industry.label}
                            </option>
                        ))}
                    </select>
                </div>
            </form>
        </Modal>
    );
}
