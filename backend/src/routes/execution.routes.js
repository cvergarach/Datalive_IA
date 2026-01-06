import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { log } from '../utils/logger.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ============================================
// GET /api/execution/history - Obtener historial de ejecuciones
// ============================================
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const { projectId, apiId } = req.query;

        if (!projectId && !apiId) {
            return res.status(400).json({ error: 'projectId o apiId es requerido' });
        }

        let query = supabase
            .from('executions')
            .select('*, apis!inner(project_id, projects!inner(user_id))')
            .order('created_at', { ascending: false })
            .limit(50);

        if (apiId) {
            query = query.eq('api_id', apiId);
        }

        if (projectId) {
            query = query.eq('apis.project_id', projectId);
        }

        const { data: executions, error } = await query;

        if (error) {
            log.error('Error al obtener historial de ejecuciones', error, {
                module: 'execution',
                userId: req.user.id
            });
            return res.status(500).json({ error: 'Error al obtener historial' });
        }

        // Filtrar solo las ejecuciones del usuario
        const userExecutions = executions.filter(
            exec => exec.apis?.projects?.user_id === req.user.id
        );

        res.json(userExecutions);
    } catch (error) {
        log.error('Error en historial de ejecuciones', error, {
            module: 'execution',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// POST /api/execution/execute - Ejecutar endpoint
// ============================================
router.post('/execute', authenticateToken, async (req, res) => {
    try {
        const { apiId, endpoint, method, params } = req.body;

        log.info('Ejecutando endpoint', {
            module: 'execution',
            userId: req.user.id,
            apiId,
            endpoint,
            method
        });

        // Verificar que la API pertenece al usuario
        const { data: api } = await supabase
            .from('apis')
            .select('*, projects!inner(user_id)')
            .eq('id', apiId)
            .single();

        if (!api || api.projects.user_id !== req.user.id) {
            return res.status(404).json({ error: 'API no encontrada' });
        }

        // Crear registro de ejecución
        const executionData = {
            api_id: apiId,
            endpoint,
            method,
            request_params: params || {},
            status: 'pending'
        };

        const { data: execution, error } = await supabase
            .from('executions')
            .insert(executionData)
            .select()
            .single();

        if (error) {
            log.error('Error al crear ejecución', error, {
                module: 'execution',
                userId: req.user.id
            });
            return res.status(500).json({ error: 'Error al crear ejecución' });
        }

        // Aquí iría la lógica real de ejecución del endpoint
        // Por ahora retornamos la ejecución pendiente
        res.status(201).json(execution);
    } catch (error) {
        log.error('Error en ejecución de endpoint', error, {
            module: 'execution',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// POST /api/execution/execute-all - Ejecutar todos los endpoints
// ============================================
router.post('/execute-all', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.body;

        log.info('Ejecutando todos los endpoints del proyecto', {
            module: 'execution',
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

        // Obtener todas las APIs del proyecto
        const { data: apis } = await supabase
            .from('apis')
            .select('*')
            .eq('project_id', projectId);

        if (!apis || apis.length === 0) {
            return res.status(404).json({ error: 'No hay APIs para ejecutar' });
        }

        // Crear ejecuciones para cada endpoint
        const executions = [];
        for (const api of apis) {
            if (api.endpoints && Array.isArray(api.endpoints)) {
                for (const endpoint of api.endpoints) {
                    const executionData = {
                        api_id: api.id,
                        endpoint: endpoint.path,
                        method: endpoint.method,
                        status: 'pending'
                    };
                    executions.push(executionData);
                }
            }
        }

        if (executions.length > 0) {
            await supabase
                .from('executions')
                .insert(executions);
        }

        res.json({
            message: `${executions.length} ejecuciones iniciadas`,
            count: executions.length
        });
    } catch (error) {
        log.error('Error en ejecución masiva', error, {
            module: 'execution',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export default router;
