import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';
import expressWinston from 'express-winston';
import winston from 'winston';
import { log, setSocketIO } from './utils/logger.js';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import documentsRoutes from './routes/documents.routes.js';
import aiRoutes from './routes/ai.routes.js';
import logsRoutes from './routes/logs.routes.js';
import executionRoutes from './routes/execution.routes.js';
import modelsRoutes from './routes/models.routes.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Configurar Socket.IO en el logger
setSocketIO(io);

const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================

// CORS
app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (como Postman) en desarrollo
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:3000',
            'https://datalive-ia-gdpd.vercel.app',
            'https://datalive-ia-gdpd-kxrzlzufr-cesar-s-projects-548085a2.vercel.app',
            process.env.FRONTEND_URL
        ].filter(Boolean).map(url => url.replace(/\/$/, '')); // Remover barras finales

        const originWithoutSlash = origin.replace(/\/$/, '');

        if (allowedOrigins.includes(originWithoutSlash)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logger de requests HTTP
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ),
    meta: false,
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    expressFormat: true,
    colorize: true
}));

// ============================================
// RUTAS
// ============================================

// Health check
app.get('/health', (req, res) => {
    log.info('Health check', { module: 'server' });
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'DataLIVE Backend'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/execution', executionRoutes);
app.use('/api', modelsRoutes);

// Ruta 404
app.use((req, res) => {
    log.warn(`Ruta no encontrada: ${req.method} ${req.url}`, {
        module: 'server',
        method: req.method,
        url: req.url
    });
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// ============================================
// MANEJO DE ERRORES GLOBAL
// ============================================

app.use((err, req, res, next) => {
    log.error('Error no manejado', err, {
        module: 'server',
        method: req.method,
        url: req.url,
        userId: req.user?.id
    });

    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// WEBSOCKET
// ============================================

io.on('connection', (socket) => {
    log.info('Cliente WebSocket conectado', {
        module: 'websocket',
        socketId: socket.id
    });

    socket.on('disconnect', () => {
        log.info('Cliente WebSocket desconectado', {
            module: 'websocket',
            socketId: socket.id
        });
    });

    socket.on('subscribe-logs', (data) => {
        log.info('Cliente suscrito a logs', {
            module: 'websocket',
            socketId: socket.id,
            filters: data
        });
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

httpServer.listen(PORT, () => {
    log.info(`🚀 Servidor DataLIVE iniciado en puerto ${PORT}`, {
        module: 'server',
        port: PORT,
        env: process.env.NODE_ENV || 'development'
    });

    log.info('📊 Sistema de logging activo', {
        module: 'server',
        features: ['Console', 'File', 'Database', 'WebSocket']
    });
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
    log.error('Unhandled Rejection', new Error(reason), {
        module: 'process',
        promise: promise
    });
});

process.on('uncaughtException', (error) => {
    log.error('Uncaught Exception', error, {
        module: 'process'
    });
    process.exit(1);
});

export default app;
