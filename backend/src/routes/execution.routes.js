import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { log } from '../utils/logger.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { detectAuthenticationMethod, saveCredentials } from '../services/ai/auth-detector.service.js';
import { executeEndpoint, executeAllEndpoints } from '../services/ai/api-executor.service.js';

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ============================================
// POST /api/execution/detect-auth/:apiId
// Detectar método de autenticación
// ============================================
router.post('/detect-auth/:apiId', authenticateToken, async (req, res) => {
    try {
        const { apiId } = req.params;

        log.info('Detectando autenticación', {
            module: 'execution',
            userId: req.user.id,
            apiId
        });

        // Obtener API y documento
        const { data: api } = await supabase
            .from('apis')
            .select('*, documents(*), projects!inner(user_id)')
            .eq('id', apiId)
            .single();

        if (!api || api.projects.user_id !== req.user.id) {
            return res.status(404).json({ error: 'API no encontrada' });
        }

        // Obtener texto del documento
        const documentText = api.documents?.analysis_result || '';

        const authDetails = await detectAuthenticationMethod(
            apiId,
            JSON.stringify(documentText),
            req.user.id
        );

        res.json(authDetails);
    } catch (error) {
        log.error('Error al detectar autenticación', error, {
            module: 'execution',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error al detectar autenticación' });
    }
});

// ============================================
// POST /api/execution/save-credentials/:apiId
// Guardar credenciales del usuario
// ============================================
router.post('/save-credentials/:apiId', authenticateToken, async (req, res) => {
    try {
        const { apiId } = req.params;
        const { credentials } = req.body;

        log.info('Guardando credenciales', {
            module: 'execution',
            userId: req.user.id,
            apiId
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

        await saveCredentials(apiId, credentials, req.user.id);

        res.json({ message: 'Credenciales guardadas exitosamente' });
    } catch (error) {
        log.error('Error al guardar credenciales', error, {
            module: 'execution',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error al guardar credenciales' });
    }
});

// ============================================
// POST /api/execution/execute/:apiId/:endpointIndex
// Ejecutar un endpoint específico
// ============================================
router.post('/execute/:apiId/:endpointIndex', authenticateToken, async (req, res) => {
    try {
        const { apiId, endpointIndex } = req.params;
        const { params: userParams } = req.body;

        log.info('Ejecutando endpoint', {
            module: 'execution',
            userId: req.user.id,
            apiId,
            endpointIndex
        });

        // Obtener API
        const { data: api } = await supabase
            .from('apis')
            .select('*, projects!inner(user_id, id)')
            .eq('id', apiId)
            .single();

        if (!api || api.projects.user_id !== req.user.id) {
            return res.status(404).json({ error: 'API no encontrada' });
        }

        const endpoint = api.endpoints[parseInt(endpointIndex)];
        if (!endpoint) {
            return res.status(404).json({ error: 'Endpoint no encontrado' });
        }

        const result = await executeEndpoint(
            apiId,
            endpoint,
            userParams || {},
            req.user.id,
            api.projects.id
        );

        res.json(result);
    } catch (error) {
        log.error('Error al ejecutar endpoint', error, {
            module: 'execution',
            userId: req.user.id
        });
        res.status(500).json({ error: error.message || 'Error al ejecutar endpoint' });
    }
});

// ============================================
// POST /api/execution/execute-all/:apiId
// Ejecutar TODOS los endpoints automáticamente
// ============================================
router.post('/execute-all/:apiId', authenticateToken, async (req, res) => {
    try {
        const { apiId } = req.params;

        log.info('Ejecutando todos los endpoints', {
            module: 'execution',
            userId: req.user.id,
            apiId
        });

        // Obtener API
        const { data: api } = await supabase
            .from('apis')
            .select('*, projects!inner(user_id, id)')
            .eq('id', apiId)
            .single();

        if (!api || api.projects.user_id !== req.user.id) {
            return res.status(404).json({ error: 'API no encontrada' });
        }

        const results = await executeAllEndpoints(
            apiId,
            req.user.id,
            api.projects.id
        );

        res.json({
            total: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        });
    } catch (error) {
        log.error('Error al ejecutar todos los endpoints', error, {
            module: 'execution',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error al ejecutar endpoints' });
    }
});

// ============================================
// GET /api/execution/history/:apiId
// Obtener historial de ejecuciones
// ============================================
router.get('/history/:apiId', authenticateToken, async (req, res) => {
    try {
        const { apiId } = req.params;

        log.debug('Obteniendo historial de ejecuciones', {
            module: 'execution',
            userId: req.user.id,
            apiId
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

        const { data: executions, error } = await supabase
            .from('executions')
            .select('*')
            .eq('api_id', apiId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json(executions);
    } catch (error) {
        log.error('Error al obtener historial', error, {
            module: 'execution',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

export default router;
