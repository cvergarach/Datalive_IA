import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { log } from '../utils/logger.js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Inicializar clientes de IA
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

// Modelos disponibles
export const AVAILABLE_MODELS = {
    GEMINI_FLASH: 'gemini-2.0-flash-exp',
    CLAUDE_SONNET: 'claude-3-5-sonnet-20241022',
    CLAUDE_OPUS: 'claude-3-5-opus-20250115',
    CLAUDE_HAIKU: 'claude-3-5-haiku-20241022'
};

// Tipos de tareas
export const TASK_TYPES = {
    DOCUMENT_ANALYSIS: 'document_analysis',
    AUTH_DETECTION: 'auth_detection',
    API_EXECUTION: 'api_execution',
    REPORT_GENERATION: 'report_generation',
    INSIGHT_GENERATION: 'insight_generation',
    DASHBOARD_GENERATION: 'dashboard_generation'
};

/**
 * Obtener preferencia de modelo del usuario para una tarea
 */
async function getUserModelPreference(userId, taskType) {
    try {
        const { data } = await supabase
            .from('ai_model_preferences')
            .select('model')
            .eq('user_id', userId)
            .eq('task_type', taskType)
            .single();

        return data?.model || AVAILABLE_MODELS.GEMINI_FLASH; // Default
    } catch (error) {
        log.debug('No se encontró preferencia de modelo, usando default', {
            module: 'ai-orchestrator',
            userId,
            taskType
        });
        return AVAILABLE_MODELS.GEMINI_FLASH;
    }
}

/**
 * Ejecutar prompt con Gemini
 */
async function executeGemini(prompt, modelName = AVAILABLE_MODELS.GEMINI_FLASH) {
    log.debug('Ejecutando con Gemini', {
        module: 'ai-orchestrator',
        model: modelName
    });

    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

/**
 * Ejecutar prompt con Claude
 */
async function executeClaude(prompt, modelName = AVAILABLE_MODELS.CLAUDE_SONNET) {
    log.debug('Ejecutando con Claude', {
        module: 'ai-orchestrator',
        model: modelName
    });

    const message = await anthropic.messages.create({
        model: modelName,
        max_tokens: 8192,
        messages: [{
            role: 'user',
            content: prompt
        }]
    });

    return message.content[0].text;
}

/**
 * Orquestador principal de IA
 * Selecciona el modelo apropiado según preferencias del usuario
 */
export async function executeAI(prompt, userId, taskType, projectId = null) {
    const startTime = Date.now();

    try {
        // Obtener preferencia de modelo
        const preferredModel = await getUserModelPreference(userId, taskType);

        log.info('Iniciando ejecución de IA', {
            module: 'ai-orchestrator',
            userId,
            projectId,
            taskType,
            model: preferredModel
        });

        let response;

        // Ejecutar según modelo
        if (preferredModel === AVAILABLE_MODELS.GEMINI_FLASH) {
            response = await executeGemini(prompt, preferredModel);
        } else {
            // Todos los modelos Claude
            response = await executeClaude(prompt, preferredModel);
        }

        const executionTime = Date.now() - startTime;

        log.info('Ejecución de IA completada', {
            module: 'ai-orchestrator',
            userId,
            projectId,
            taskType,
            model: preferredModel,
            executionTime,
            responseLength: response.length
        });

        return {
            response,
            model: preferredModel,
            executionTime
        };
    } catch (error) {
        const executionTime = Date.now() - startTime;

        log.error('Error en ejecución de IA', error, {
            module: 'ai-orchestrator',
            userId,
            projectId,
            taskType,
            executionTime
        });

        // Intentar fallback a Gemini si falló otro modelo
        if (error.message.includes('anthropic') || error.message.includes('claude')) {
            log.warn('Intentando fallback a Gemini', {
                module: 'ai-orchestrator',
                userId,
                taskType
            });

            try {
                const response = await executeGemini(prompt);
                return {
                    response,
                    model: AVAILABLE_MODELS.GEMINI_FLASH,
                    executionTime: Date.now() - startTime,
                    fallback: true
                };
            } catch (fallbackError) {
                log.error('Fallback también falló', fallbackError, {
                    module: 'ai-orchestrator',
                    userId,
                    taskType
                });
                throw fallbackError;
            }
        }

        throw error;
    }
}

/**
 * Actualizar preferencia de modelo del usuario
 */
export async function updateModelPreference(userId, taskType, model) {
    try {
        log.info('Actualizando preferencia de modelo', {
            module: 'ai-orchestrator',
            userId,
            taskType,
            model
        });

        const { error } = await supabase
            .from('ai_model_preferences')
            .upsert({
                user_id: userId,
                task_type: taskType,
                model
            }, {
                onConflict: 'user_id,task_type'
            });

        if (error) throw error;

        log.info('Preferencia de modelo actualizada', {
            module: 'ai-orchestrator',
            userId,
            taskType,
            model
        });

        return true;
    } catch (error) {
        log.error('Error al actualizar preferencia de modelo', error, {
            module: 'ai-orchestrator',
            userId,
            taskType
        });
        throw error;
    }
}
