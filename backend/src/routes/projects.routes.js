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
// GET /api/projects - Listar proyectos del usuario
// ============================================
router.get('/', authenticateToken, async (req, res) => {
    try {
        log.info('Listando proyectos', {
            module: 'projects',
            userId: req.user.id
        });

        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            log.error('Error al listar proyectos', error, {
                module: 'projects',
                userId: req.user.id
            });
            return res.status(500).json({ error: 'Error al obtener proyectos' });
        }

        log.debug(`${projects.length} proyectos encontrados`, {
            module: 'projects',
            userId: req.user.id,
            count: projects.length
        });

        res.json(projects);
    } catch (error) {
        log.error('Error en listado de proyectos', error, {
            module: 'projects',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// POST /api/projects - Crear proyecto
// ============================================
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, description, industry } = req.body;

        log.info('Creando nuevo proyecto', {
            module: 'projects',
            userId: req.user.id,
            name,
            industry
        });

        if (!name) {
            log.warn('Creación de proyecto fallida: nombre faltante', {
                module: 'projects',
                userId: req.user.id
            });
            return res.status(400).json({ error: 'El nombre del proyecto es requerido' });
        }

        const { data: project, error } = await supabase
            .from('projects')
            .insert({
                user_id: req.user.id,
                name,
                description,
                industry
            })
            .select()
            .single();

        if (error) {
            log.error('Error al crear proyecto', error, {
                module: 'projects',
                userId: req.user.id
            });
            return res.status(500).json({ error: 'Error al crear proyecto' });
        }

        log.info('Proyecto creado exitosamente', {
            module: 'projects',
            userId: req.user.id,
            projectId: project.id,
            name: project.name
        });

        res.status(201).json(project);
    } catch (error) {
        log.error('Error en creación de proyecto', error, {
            module: 'projects',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// GET /api/projects/:id - Obtener proyecto
// ============================================
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        log.debug('Obteniendo proyecto', {
            module: 'projects',
            userId: req.user.id,
            projectId: id
        });

        const { data: project, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .eq('user_id', req.user.id)
            .single();

        if (error || !project) {
            log.warn('Proyecto no encontrado', {
                module: 'projects',
                userId: req.user.id,
                projectId: id
            });
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        res.json(project);
    } catch (error) {
        log.error('Error al obtener proyecto', error, {
            module: 'projects',
            userId: req.user.id,
            projectId: req.params.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// PUT /api/projects/:id - Actualizar proyecto
// ============================================
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, industry } = req.body;

        log.info('Actualizando proyecto', {
            module: 'projects',
            userId: req.user.id,
            projectId: id
        });

        const { data: project, error } = await supabase
            .from('projects')
            .update({ name, description, industry })
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error || !project) {
            log.warn('Error al actualizar proyecto', {
                module: 'projects',
                userId: req.user.id,
                projectId: id,
                error: error?.message
            });
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        log.info('Proyecto actualizado exitosamente', {
            module: 'projects',
            userId: req.user.id,
            projectId: id
        });

        res.json(project);
    } catch (error) {
        log.error('Error en actualización de proyecto', error, {
            module: 'projects',
            userId: req.user.id,
            projectId: req.params.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// DELETE /api/projects/:id - Eliminar proyecto
// ============================================
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        log.info('Eliminando proyecto', {
            module: 'projects',
            userId: req.user.id,
            projectId: id
        });

        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.id);

        if (error) {
            log.error('Error al eliminar proyecto', error, {
                module: 'projects',
                userId: req.user.id,
                projectId: id
            });
            return res.status(500).json({ error: 'Error al eliminar proyecto' });
        }

        log.info('Proyecto eliminado exitosamente', {
            module: 'projects',
            userId: req.user.id,
            projectId: id
        });

        res.json({ message: 'Proyecto eliminado exitosamente' });
    } catch (error) {
        log.error('Error en eliminación de proyecto', error, {
            module: 'projects',
            userId: req.user.id,
            projectId: req.params.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export default router;
