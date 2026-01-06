import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { log } from '../utils/logger.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { AVAILABLE_MODELS, TASK_TYPES, updateModelPreference } from '../services/ai-orchestrator.service.js';
import { getAvailableIndustries } from '../services/industry-experts/index.js';

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ============================================
// GET /api/ai/models - Listar modelos disponibles
// ============================================
router.get('/models', authenticateToken, (req, res) => {
    log.debug('Listando modelos de IA disponibles', {
        module: 'ai',
        userId: req.user.id
    });

    res.json({
        models: Object.entries(AVAILABLE_MODELS).map(([key, value]) => ({
            id: value,
            name: key.replace(/_/g, ' '),
            provider: value.startsWith('gemini') ? 'Google' : 'Anthropic'
        })),
        taskTypes: Object.entries(TASK_TYPES).map(([key, value]) => ({
            id: value,
            name: key.replace(/_/g, ' ')
        })),
        industries: getAvailableIndustries()
    });
});

// ============================================
// GET /api/ai/preferences - Obtener preferencias
// ============================================
router.get('/preferences', authenticateToken, async (req, res) => {
    try {
        log.debug('Obteniendo preferencias de modelos IA', {
            module: 'ai',
            userId: req.user.id
        });

        const { data: preferences, error } = await supabase
            .from('ai_model_preferences')
            .select('*')
            .eq('user_id', req.user.id);

        if (error) {
            log.error('Error al obtener preferencias', error, {
                module: 'ai',
                userId: req.user.id
            });
            return res.status(500).json({ error: 'Error al obtener preferencias' });
        }

        res.json(preferences || []);
    } catch (error) {
        log.error('Error en obtención de preferencias', error, {
            module: 'ai',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// PUT /api/ai/preferences - Actualizar preferencias
// ============================================
router.put('/preferences', authenticateToken, async (req, res) => {
    try {
        const { taskType, model } = req.body;

        log.info('Actualizando preferencia de modelo IA', {
            module: 'ai',
            userId: req.user.id,
            taskType,
            model
        });

        if (!taskType || !model) {
            return res.status(400).json({ error: 'taskType y model son requeridos' });
        }

        await updateModelPreference(req.user.id, taskType, model);

        res.json({ message: 'Preferencia actualizada exitosamente' });
    } catch (error) {
        log.error('Error al actualizar preferencia', error, {
            module: 'ai',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// GET /api/ai/apis/:projectId - Listar APIs descubiertas
// ============================================
router.get('/apis/:projectId', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;

        log.debug('Listando APIs descubiertas', {
            module: 'ai',
            userId: req.user.id,
            projectId
        });

        // Verificar que el proyecto pertenece al usuario
        const { data: project } = await supabase
            .from('projects')
            .select('id')
            .eq('id', projectId)
            .eq('user_id', req.user.id)
            .single();

        if (!project) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        const { data: apis, error } = await supabase
            .from('apis')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            log.error('Error al listar APIs', error, {
                module: 'ai',
                userId: req.user.id,
                projectId
            });
            return res.status(500).json({ error: 'Error al obtener APIs' });
        }

        res.json(apis);
    } catch (error) {
        log.error('Error en listado de APIs', error, {
            module: 'ai',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Placeholder para otras rutas de IA
// TODO: Implementar rutas para ejecutar APIs, generar reportes, insights, dashboards

export default router;
