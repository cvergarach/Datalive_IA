// Store de proyectos con Zustand
import { create } from 'zustand';
import api from '@/lib/api';

export const useProjectStore = create((set, get) => ({
    projects: [],
    currentProject: null,
    loading: false,
    error: null,

    // Obtener todos los proyectos
    fetchProjects: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.get('/api/projects');
            set({ projects: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Obtener un proyecto por ID
    fetchProject: async (id) => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.get(`/api/projects/${id}`);
            set({ currentProject: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Crear proyecto
    createProject: async (projectData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.post('/api/projects', projectData);
            set((state) => ({
                projects: [...state.projects, data],
                loading: false
            }));
            return data;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Actualizar proyecto
    updateProject: async (id, projectData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.put(`/api/projects/${id}`, projectData);
            set((state) => ({
                projects: state.projects.map(p => p.id === id ? data : p),
                currentProject: state.currentProject?.id === id ? data : state.currentProject,
                loading: false
            }));
            return data;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Eliminar proyecto
    deleteProject: async (id) => {
        set({ loading: false, error: null });
        try {
            await api.delete(`/api/projects/${id}`);
            set((state) => ({
                projects: state.projects.filter(p => p.id !== id),
                currentProject: state.currentProject?.id === id ? null : state.currentProject,
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Limpiar proyecto actual
    clearCurrentProject: () => set({ currentProject: null })
}));
