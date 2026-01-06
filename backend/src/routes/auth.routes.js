import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { log } from '../utils/logger.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ============================================
// POST /api/auth/register - Registro (solo admin)
// ============================================
router.post('/register', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { email, password, fullName, role = 'user' } = req.body;

        log.info('Intento de registro de nuevo usuario', {
            module: 'auth',
            adminId: req.user.id,
            newUserEmail: email,
            newUserRole: role
        });

        // Validaciones
        if (!email || !password || !fullName) {
            log.warn('Registro fallido: campos faltantes', {
                module: 'auth',
                email
            });
            return res.status(400).json({ error: 'Email, contraseña y nombre completo son requeridos' });
        }

        // Verificar si el usuario ya existe
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            log.warn('Registro fallido: usuario ya existe', {
                module: 'auth',
                email
            });
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Hash de contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Crear usuario
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                email,
                password_hash: passwordHash,
                full_name: fullName,
                role
            })
            .select()
            .single();

        if (error) {
            log.error('Error al crear usuario', error, {
                module: 'auth',
                email
            });
            return res.status(500).json({ error: 'Error al crear usuario' });
        }

        log.info('Usuario creado exitosamente', {
            module: 'auth',
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role,
            createdBy: req.user.id
        });

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: {
                id: newUser.id,
                email: newUser.email,
                fullName: newUser.full_name,
                role: newUser.role
            }
        });
    } catch (error) {
        log.error('Error en registro', error, { module: 'auth' });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// POST /api/auth/login - Login
// ============================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        log.info('Intento de login', {
            module: 'auth',
            email,
            ip: req.ip
        });

        if (!email || !password) {
            log.warn('Login fallido: campos faltantes', {
                module: 'auth',
                email
            });
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        // Buscar usuario
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            log.warn('Login fallido: usuario no encontrado', {
                module: 'auth',
                email
            });
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (!user.is_active) {
            log.warn('Login fallido: usuario inactivo', {
                module: 'auth',
                email,
                userId: user.id
            });
            return res.status(401).json({ error: 'Usuario inactivo' });
        }

        // Verificar contraseña
        log.debug('Verificando contraseña', {
            module: 'auth',
            email,
            userId: user.id,
            passwordLength: password.length,
            hashLength: user.password_hash?.length,
            hashPrefix: user.password_hash?.substring(0, 10)
        });

        const validPassword = await bcrypt.compare(password, user.password_hash);

        log.debug('Resultado de verificación', {
            module: 'auth',
            email,
            userId: user.id,
            validPassword
        });

        if (!validPassword) {
            log.warn('Login fallido: contraseña incorrecta', {
                module: 'auth',
                email,
                userId: user.id
            });
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Actualizar last_login
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);

        // Generar token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        log.info('Login exitoso', {
            module: 'auth',
            userId: user.id,
            email: user.email,
            role: user.role
        });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        log.error('Error en login', error, { module: 'auth' });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// GET /api/auth/me - Usuario actual
// ============================================
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, full_name, role, created_at, last_login')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            log.warn('Usuario no encontrado', {
                module: 'auth',
                userId: req.user.id
            });
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        log.debug('Usuario obtenido', {
            module: 'auth',
            userId: user.id
        });

        res.json({
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            createdAt: user.created_at,
            lastLogin: user.last_login
        });
    } catch (error) {
        log.error('Error al obtener usuario', error, {
            module: 'auth',
            userId: req.user.id
        });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// POST /api/auth/logout - Logout
// ============================================
router.post('/logout', authenticateToken, (req, res) => {
    log.info('Usuario cerró sesión', {
        module: 'auth',
        userId: req.user.id
    });
    res.json({ message: 'Sesión cerrada exitosamente' });
});

export default router;
