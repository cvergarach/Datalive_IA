import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { log } from '../utils/logger.js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Inicializar clientes de IA
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || ''
});
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ''
});

// Modelos disponibles - Enero 2026
export const AVAILABLE_MODELS = {
    // Gemini (Google)
    'gemini-2.5-flash': { provider: 'google', name: 'Gemini 2.5 Flash' },
    'gemini-2.0-flash-exp': { provider: 'google', name: 'Gemini 2.0 Flash Exp' },
    'gemini-2.0-pro': { provider: 'google', name: 'Gemini 2.0 Pro' },
    'gemini-1.5-pro': { provider: 'google', name: 'Gemini 1.5 Pro' },

    // Claude (Anthropic)
    'claude-4-sonnet-20260115': { provider: 'anthropic', name: 'Claude 4 Sonnet' },
    'claude-3-5-sonnet-20241022': { provider: 'anthropic', name: 'Claude 3.5 Sonnet' },
    'claude-3-5-haiku-20241022': { provider: 'anthropic', name: 'Claude 3.5 Haiku' },
    'claude-3-opus-20240229': { provider: 'anthropic', name: 'Claude 3 Opus' },

    // GPT (OpenAI)
    'gpt-4o': { provider: 'openai', name: 'GPT-4o' },
    'gpt-4-turbo': { provider: 'openai', name: 'GPT-4 Turbo' },
    'gpt-4o-mini': { provider: 'openai', name: 'GPT-4o Mini' },
    'o1-preview': { provider: 'openai', name: 'o1 Preview' },
    'o1-mini': { provider: 'openai', name: 'o1 Mini' },

    // Qwen (Alibaba) - via OpenAI compatible API
    'qwen-2.5-72b-instruct': { provider: 'qwen', name: 'Qwen 2.5 72B' },
    'qwen-2.5-32b-instruct': { provider: 'qwen', name: 'Qwen 2.5 32B' },
    'qwen-2-72b-instruct': { provider: 'qwen', name: 'Qwen 2 72B' }
};

// Default model
export const DEFAULT_MODEL = 'gemini-2.5-flash';

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
 * Obtener preferencia de modelo global del usuario
 */
async function getUserModelPreference(userId) {
    try {
        const { data } = await supabase
            .from('user_preferences')
            .select('default_model')
            .eq('user_id', userId)
            .single();

        return data?.default_model || DEFAULT_MODEL;
    } catch (error) {
        log.debug('No se encontró preferencia de modelo, usando default', {
            module: 'ai-orchestrator',
            userId
        });
        return DEFAULT_MODEL;
    }
}

/**
 * Ejecutar prompt con Gemini
 */
async function executeGemini(prompt, modelName) {
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
async function executeClaude(prompt, modelName) {
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
 * Ejecutar prompt con OpenAI
 */
async function executeOpenAI(prompt, modelName) {
    log.debug('Ejecutando con OpenAI', {
        module: 'ai-orchestrator',
        model: modelName
    });

    const completion = await openai.chat.completions.create({
        model: modelName,
        messages: [{
            role: 'user',
            content: prompt
        }],
        max_tokens: 8192
    });

    return completion.choices[0].message.content;
}

/**
 * Ejecutar prompt con Qwen (via compatible API)
 */
async function executeQwen(prompt, modelName) {
    log.debug('Ejecutando con Qwen', {
        module: 'ai-orchestrator',
        model: modelName
    });

    // Qwen usa API compatible con OpenAI
    const qwenClient = new OpenAI({
        apiKey: process.env.QWEN_API_KEY || '',
        baseURL: process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    });

    const completion = await qwenClient.chat.completions.create({
        model: modelName,
        messages: [{
            role: 'user',
            content: prompt
        }],
        max_tokens: 8192
    });

    return completion.choices[0].message.content;
}

/**
 * Orquestador principal de IA
 */
export async function executeAI(prompt, userId, taskType, projectId = null) {
    const startTime = Date.now();

    try {
        // Obtener preferencia de modelo global
        const preferredModel = await getUserModelPreference(userId);
        const modelConfig = AVAILABLE_MODELS[preferredModel];

        if (!modelConfig) {
            log.warn('Modelo no reconocido, usando default', {
                module: 'ai-orchestrator',
                preferredModel
            });
        }

        const provider = modelConfig?.provider || 'google';
        const modelToUse = preferredModel || DEFAULT_MODEL;

        log.info('Iniciando ejecución de IA', {
            module: 'ai-orchestrator',
            userId,
            projectId,
            taskType,
            model: modelToUse,
            provider
        });

        let response;

        // Ejecutar según proveedor
        switch (provider) {
            case 'google':
                response = await executeGemini(prompt, modelToUse);
                break;
            case 'anthropic':
                response = await executeClaude(prompt, modelToUse);
                break;
            case 'openai':
                response = await executeOpenAI(prompt, modelToUse);
                break;
            case 'qwen':
                response = await executeQwen(prompt, modelToUse);
                break;
            default:
                response = await executeGemini(prompt, DEFAULT_MODEL);
        }

        const executionTime = Date.now() - startTime;

        log.info('Ejecución de IA completada', {
            module: 'ai-orchestrator',
            userId,
            projectId,
            taskType,
            model: modelToUse,
            executionTime,
            responseLength: response?.length || 0
        });

        return {
            response,
            model: modelToUse,
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

        // Fallback a Gemini 2.5 Flash si falló otro modelo
        log.warn('Intentando fallback a Gemini 2.5 Flash', {
            module: 'ai-orchestrator',
            userId,
            taskType
        });

        try {
            const response = await executeGemini(prompt, DEFAULT_MODEL);
            return {
                response,
                model: DEFAULT_MODEL,
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
}

/**
 * Actualizar preferencia de modelo global del usuario
 */
export async function updateModelPreference(userId, model) {
    try {
        log.info('Actualizando preferencia de modelo', {
            module: 'ai-orchestrator',
            userId,
            model
        });

        const { error } = await supabase
            .from('user_preferences')
            .upsert({
                user_id: userId,
                default_model: model,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (error) throw error;

        log.info('Preferencia de modelo actualizada', {
            module: 'ai-orchestrator',
            userId,
            model
        });

        return true;
    } catch (error) {
        log.error('Error al actualizar preferencia de modelo', error, {
            module: 'ai-orchestrator',
            userId
        });
        throw error;
    }
}

/**
 * Obtener preferencia actual del usuario
 */
export async function getModelPreference(userId) {
    return await getUserModelPreference(userId);
}
