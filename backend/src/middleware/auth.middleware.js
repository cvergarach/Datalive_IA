import jwt from 'jsonwebtoken';
import { log } from '../utils/logger.js';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        log.warn('Intento de acceso sin token', {
            module: 'auth',
            url: req.url,
            method: req.method,
            ip: req.ip
        });
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            log.warn('Token inválido o expirado', {
                module: 'auth',
                error: err.message,
                url: req.url,
                ip: req.ip
            });
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }

        req.user = user;
        log.debug('Usuario autenticado', {
            module: 'auth',
            userId: user.id,
            email: user.email,
            role: user.role
        });
        next();
    });
};

export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        log.warn('Intento de acceso a ruta de admin sin permisos', {
            module: 'auth',
            userId: req.user.id,
            role: req.user.role,
            url: req.url
        });
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
    }
    next();
};
