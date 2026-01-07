import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { log } from '../utils/logger.js';
import { getAvailableModels, getDefaultModel, MODEL_CATALOG } from '../services/model-master.service.js';
import { chatWithProject, getConversationHistory } from '../services/project-chat.service.js';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ============================================
// GET /api/models - Listar modelos disponibles
// ============================================
router.get('/models', authenticateToken, (req, res) => {
    try {
        const models = getAvailableModels();
        const defaultModel = getDefaultModel();

        res.json({
            models,
            default: defaultModel,
            providers: ['google', 'anthropic', 'openai', 'qwen', 'deepseek']
        });
    } catch (error) {
        log.error('Error al listar modelos', error, {
            module: 'models',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error al obtener modelos' });
    }
});

// ============================================
// GET /api/models/catalog - Catálogo completo
// ============================================
router.get('/models/catalog', authenticateToken, (req, res) => {
    try {
        res.json(MODEL_CATALOG);
    } catch (error) {
        log.error('Error al obtener catálogo', error, {
            module: 'models',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error al obtener catálogo' });
    }
});

// ============================================
// POST /api/chat/:projectId - Chat con proyecto
// ============================================
router.post('/chat/:projectId', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { message, history } = req.body;

        log.info('Chat con proyecto', {
            module: 'chat',
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

        const result = await chatWithProject(
            projectId,
            message,
            req.user.id,
            history || []
        );

        res.json(result);
    } catch (error) {
        log.error('Error en chat', error, {
            module: 'chat',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error en el chat' });
    }
});

// ============================================
// GET /api/chat/:projectId/history - Historial
// ============================================
router.get('/chat/:projectId/history', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { limit = 20 } = req.query;

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

        const history = await getConversationHistory(projectId, parseInt(limit));

        res.json(history);
    } catch (error) {
        log.error('Error al obtener historial', error, {
            module: 'chat',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

// ============================================
// GET /api/agents/config - Configuración de agentes
// ============================================
router.get('/agents/config', authenticateToken, async (req, res) => {
    try {
        const { data: configs } = await supabase
            .from('agent_configs')
            .select('*')
            .eq('user_id', req.user.id);

        res.json(configs || []);
    } catch (error) {
        log.error('Error al obtener configuración de agentes', error, {
            module: 'agents',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error al obtener configuración' });
    }
});

// ============================================
// PUT /api/agents/config/:agentName - Actualizar config
// ============================================
router.put('/agents/config/:agentName', authenticateToken, async (req, res) => {
    try {
        const { agentName } = req.params;
        const { config } = req.body;

        log.info('Actualizando configuración de agente', {
            module: 'agents',
            userId: req.user.id,
            agentName
        });

        const { data, error } = await supabase
            .from('agent_configs')
            .upsert({
                user_id: req.user.id,
                agent_name: agentName,
                config
            }, {
                onConflict: 'user_id,agent_name'
            })
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        log.error('Error al actualizar configuración', error, {
            module: 'agents',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error al actualizar configuración' });
    }
});

// ============================================
// GET /api/models/preferences - Obtener preferencias
// ============================================
router.get('/models/preferences', authenticateToken, async (req, res) => {
    try {
        log.info('Obteniendo preferencias de modelo', {
            module: 'models',
            userId: req.user.id
        });

        const { data, error } = await supabase
            .from('user_preferences')
            .select('default_model')
            .eq('user_id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        res.json({
            default_model: data?.default_model || 'gemini-2.5-flash'
        });
    } catch (error) {
        log.error('Error al obtener preferencias', error, {
            module: 'models',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error al obtener preferencias' });
    }
});

// ============================================
// POST /api/models/preferences - Guardar preferencias
// ============================================
router.post('/models/preferences', authenticateToken, async (req, res) => {
    try {
        const { default_model } = req.body;

        log.info('Guardando preferencias de modelo', {
            module: 'models',
            userId: req.user.id,
            model: default_model
        });

        const { data, error } = await supabase
            .from('user_preferences')
            .upsert({
                user_id: req.user.id,
                default_model,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (error) throw error;

        log.info('Preferencias guardadas', {
            module: 'models',
            userId: req.user.id,
            model: default_model
        });

        res.json(data);
    } catch (error) {
        log.error('Error al guardar preferencias', error, {
            module: 'models',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error al guardar preferencias' });
    }
});

export default router;
