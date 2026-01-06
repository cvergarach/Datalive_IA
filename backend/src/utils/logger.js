import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase para logs
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Formato personalizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Transport para consola con colores
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, module, ...metadata }) => {
      let msg = `${timestamp} [${level}] [${module || 'system'}]: ${message}`;
      if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
      }
      return msg;
    })
  )
});

// Transport para archivos rotativos
const fileTransport = new DailyRotateFile({
  filename: 'logs/datalive-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: customFormat
});

// Transport para errores
const errorFileTransport = new DailyRotateFile({
  filename: 'logs/datalive-error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  format: customFormat
});

// Crear logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: [
    consoleTransport,
    fileTransport,
    errorFileTransport
  ]
});

// Socket.io instance (se configurará desde server.js)
let io = null;

export const setSocketIO = (socketIO) => {
  io = socketIO;
};

// Función para emitir logs vía WebSocket
const emitLog = (logData) => {
  if (io) {
    io.emit('log', logData);
  }
};

// Función para guardar logs en base de datos
const saveLogToDB = async (logData) => {
  try {
    await supabase.from('logs').insert({
      user_id: logData.userId || null,
      project_id: logData.projectId || null,
      level: logData.level,
      module: logData.module || 'system',
      message: logData.message,
      metadata: logData.metadata || {},
      stack_trace: logData.stack || null
    });
  } catch (error) {
    // No logear errores de logging para evitar loops
    console.error('Error saving log to DB:', error.message);
  }
};

// Wrapper para logging mejorado
export const log = {
  debug: (message, metadata = {}) => {
    const logData = { level: 'debug', message, ...metadata };
    logger.debug(message, metadata);
    emitLog(logData);
    // No guardamos debug en DB por volumen
  },
  
  info: (message, metadata = {}) => {
    const logData = { level: 'info', message, ...metadata };
    logger.info(message, metadata);
    emitLog(logData);
    saveLogToDB(logData);
  },
  
  warn: (message, metadata = {}) => {
    const logData = { level: 'warn', message, ...metadata };
    logger.warn(message, metadata);
    emitLog(logData);
    saveLogToDB(logData);
  },
  
  error: (message, error = null, metadata = {}) => {
    const logData = {
      level: 'error',
      message,
      stack: error?.stack,
      ...metadata
    };
    logger.error(message, { error: error?.message, stack: error?.stack, ...metadata });
    emitLog(logData);
    saveLogToDB(logData);
  }
};

export default logger;
