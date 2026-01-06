import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { createClient } from '@supabase/supabase-js';
import { log } from '../utils/logger.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { analyzeDocument } from '../services/ai/document-reader.service.js';

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Configurar multer para carga de archivos
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});

// ============================================
// POST /api/documents/upload - Subir documentación
// ============================================
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const { projectId } = req.body;
        const file = req.file;

        log.info('Subiendo documento', {
            module: 'documents',
            userId: req.user.id,
            projectId,
            fileName: file?.originalname
        });

        // Verificar que el proyecto pertenece al usuario
        const { data: project } = await supabase
            .from('projects')
            .select('id')
            .eq('id', projectId)
            .eq('user_id', req.user.id)
            .single();

        if (!project) {
            log.warn('Proyecto no encontrado o no autorizado', {
                module: 'documents',
                userId: req.user.id,
                projectId
            });
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        if (!file) {
            return res.status(400).json({ error: 'No se proporcionó archivo' });
        }

        // Subir archivo a Supabase Storage
        const fileName = `${projectId}/${Date.now()}_${file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype
            });

        if (uploadError) {
            log.error('Error al subir archivo a storage', uploadError, {
                module: 'documents',
                userId: req.user.id,
                projectId
            });
            return res.status(500).json({ error: 'Error al subir archivo' });
        }

        // Extraer texto del PDF
        const pdfData = await pdfParse(file.buffer);
        const textContent = pdfData.text;

        // Crear registro en BD
        const documentData = {
            project_id: projectId,
            name: file.originalname,
            type: 'pdf',
            storage_path: fileName,
            file_size: file.size,
            status: 'analyzing'
        };

        const { data: document, error: dbError } = await supabase
            .from('documents')
            .insert(documentData)
            .select()
            .single();

        if (dbError) {
            log.error('Error al crear registro de documento', dbError, {
                module: 'documents',
                userId: req.user.id,
                projectId
            });
            return res.status(500).json({ error: 'Error al crear documento' });
        }

        log.info('Documento creado, iniciando análisis', {
            module: 'documents',
            userId: req.user.id,
            projectId,
            documentId: document.id
        });

        // Iniciar análisis en background (no esperar)
        analyzeDocument(document.id, textContent, req.user.id, projectId)
            .catch(error => {
                log.error('Error en análisis de documento', error, {
                    module: 'documents',
                    userId: req.user.id,
                    projectId,
                    documentId: document.id
                });
            });

        res.status(201).json(document);
    } catch (error) {
        log.error('Error en carga de documento', error, {
            module: 'documents',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// POST /api/documents/url - Agregar URL
// ============================================
router.post('/url', authenticateToken, async (req, res) => {
    try {
        const { projectId, url } = req.body;

        log.info('Agregando URL', {
            module: 'documents',
            userId: req.user.id,
            projectId,
            url
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

        // Crear registro en BD
        const documentData = {
            project_id: projectId,
            name: url,
            type: 'url',
            url: url,
            status: 'analyzing'
        };

        const { data: document, error: dbError } = await supabase
            .from('documents')
            .insert(documentData)
            .select()
            .single();

        if (dbError) {
            log.error('Error al crear registro de URL', dbError, {
                module: 'documents',
                userId: req.user.id,
                projectId
            });
            return res.status(500).json({ error: 'Error al crear documento' });
        }

        res.status(201).json(document);
    } catch (error) {
        log.error('Error al agregar URL', error, {
            module: 'documents',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// GET /api/documents - Listar documentos (con query param)
// ============================================
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.query;

        if (!projectId) {
            return res.status(400).json({ error: 'projectId es requerido' });
        }

        log.debug('Listando documentos', {
            module: 'documents',
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

        const { data: documents, error } = await supabase
            .from('documents')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            log.error('Error al listar documentos', error, {
                module: 'documents',
                userId: req.user.id,
                projectId
            });
            return res.status(500).json({ error: 'Error al obtener documentos' });
        }

        res.json(documents);
    } catch (error) {
        log.error('Error en listado de documentos', error, {
            module: 'documents',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// GET /api/documents/project/:projectId - Listar documentos
// ============================================
router.get('/project/:projectId', authenticateToken, async (req, res) => {
    try {
        const { projectId } = req.params;

        log.debug('Listando documentos', {
            module: 'documents',
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
            log.warn('Proyecto no encontrado', {
                module: 'documents',
                userId: req.user.id,
                projectId
            });
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        const { data: documents, error } = await supabase
            .from('documents')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            log.error('Error al listar documentos', error, {
                module: 'documents',
                userId: req.user.id,
                projectId
            });
            return res.status(500).json({ error: 'Error al obtener documentos' });
        }

        res.json(documents);
    } catch (error) {
        log.error('Error en listado de documentos', error, {
            module: 'documents',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// DELETE /api/documents/:id - Eliminar documento
// ============================================
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        log.info('Eliminando documento', {
            module: 'documents',
            userId: req.user.id,
            documentId: id
        });

        // Obtener documento y verificar permisos
        const { data: document } = await supabase
            .from('documents')
            .select('*, projects!inner(user_id)')
            .eq('id', id)
            .single();

        if (!document || document.projects.user_id !== req.user.id) {
            log.warn('Documento no encontrado o no autorizado', {
                module: 'documents',
                userId: req.user.id,
                documentId: id
            });
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        // Eliminar archivo de storage si existe
        if (document.storage_path) {
            await supabase.storage
                .from('documents')
                .remove([document.storage_path]);
        }

        // Eliminar registro
        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', id);

        if (error) {
            log.error('Error al eliminar documento', error, {
                module: 'documents',
                userId: req.user.id,
                documentId: id
            });
            return res.status(500).json({ error: 'Error al eliminar documento' });
        }

        log.info('Documento eliminado exitosamente', {
            module: 'documents',
            userId: req.user.id,
            documentId: id
        });

        res.json({ message: 'Documento eliminado exitosamente' });
    } catch (error) {
        log.error('Error en eliminación de documento', error, {
            module: 'documents',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export default router;
