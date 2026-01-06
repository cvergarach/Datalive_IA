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
// GET /api/logs - Obtener logs con filtros
// ============================================
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { level, module, startDate, endDate, limit = 100 } = req.query;

        log.debug('Obteniendo logs', {
            module: 'logs',
            userId: req.user.id,
            filters: { level, module, startDate, endDate, limit }
        });

        let query = supabase
            .from('logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(parseInt(limit));

        // Filtrar por usuario (admin puede ver todos)
        if (req.user.role !== 'admin') {
            query = query.eq('user_id', req.user.id);
        }

        // Aplicar filtros
        if (level) {
            query = query.eq('level', level);
        }
        if (module) {
            query = query.eq('module', module);
        }
        if (startDate) {
            query = query.gte('created_at', startDate);
        }
        if (endDate) {
            query = query.lte('created_at', endDate);
        }

        const { data: logs, error } = await query;

        if (error) {
            log.error('Error al obtener logs', error, {
                module: 'logs',
                userId: req.user.id
            });
            return res.status(500).json({ error: 'Error al obtener logs' });
        }

        res.json(logs);
    } catch (error) {
        log.error('Error en obtención de logs', error, {
            module: 'logs',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// DELETE /api/logs - Limpiar logs antiguos
// ============================================
router.delete('/', authenticateToken, async (req, res) => {
    try {
        const { days = 30 } = req.query;

        log.info('Limpiando logs antiguos', {
            module: 'logs',
            userId: req.user.id,
            days
        });

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

        let query = supabase
            .from('logs')
            .delete()
            .lt('created_at', cutoffDate.toISOString());

        // Solo admin puede limpiar todos los logs
        if (req.user.role !== 'admin') {
            query = query.eq('user_id', req.user.id);
        }

        const { error } = await query;

        if (error) {
            log.error('Error al limpiar logs', error, {
                module: 'logs',
                userId: req.user.id
            });
            return res.status(500).json({ error: 'Error al limpiar logs' });
        }

        log.info('Logs limpiados exitosamente', {
            module: 'logs',
            userId: req.user.id,
            days
        });

        res.json({ message: 'Logs limpiados exitosamente' });
    } catch (error) {
        log.error('Error en limpieza de logs', error, {
            module: 'logs',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export default router;
