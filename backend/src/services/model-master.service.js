/**
 * Módulo Master de Modelos de IA
 * Diseño extensible para agregar nuevos modelos sin cambios estructurales
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { log } from '../utils/logger.js';

// ============================================
// CONFIGURACIÓN DE PROVEEDORES
// ============================================

const PROVIDERS = {
    GOOGLE: 'google',
    ANTHROPIC: 'anthropic',
    OPENAI: 'openai',
    QWEN: 'qwen',
    DEEPSEEK: 'deepseek'
};

// ============================================
// CATÁLOGO DE MODELOS
// Agregar nuevos modelos aquí sin cambiar código
// ============================================

export const MODEL_CATALOG = {
    // Google Gemini
    'gemini-2.0-flash-exp': {
        provider: PROVIDERS.GOOGLE,
        name: 'Gemini 2.0 Flash',
        description: 'Modelo rápido y eficiente de Google',
        maxTokens: 8192,
        supportsStreaming: true,
        costPer1kTokens: 0.0001,
        enabled: true
    },
    'gemini-2.5-flash': {
        provider: PROVIDERS.GOOGLE,
        name: 'Gemini 2.5 Flash',
        description: 'Última versión de Gemini Flash (por defecto)',
        maxTokens: 8192,
        supportsStreaming: true,
        costPer1kTokens: 0.0001,
        enabled: true,
        isDefault: true
    },
    'gemini-pro': {
        provider: PROVIDERS.GOOGLE,
        name: 'Gemini Pro',
        description: 'Modelo avanzado de Google',
        maxTokens: 32768,
        supportsStreaming: true,
        costPer1kTokens: 0.0005,
        enabled: true
    },

    // Anthropic Claude
    'claude-3-5-sonnet-20241022': {
        provider: PROVIDERS.ANTHROPIC,
        name: 'Claude 3.5 Sonnet',
        description: 'Modelo equilibrado de Anthropic',
        maxTokens: 8192,
        supportsStreaming: true,
        costPer1kTokens: 0.003,
        enabled: true
    },
    'claude-3-5-opus-20250115': {
        provider: PROVIDERS.ANTHROPIC,
        name: 'Claude 3.5 Opus',
        description: 'Modelo más potente de Anthropic',
        maxTokens: 8192,
        supportsStreaming: true,
        costPer1kTokens: 0.015,
        enabled: true
    },
    'claude-3-5-haiku-20241022': {
        provider: PROVIDERS.ANTHROPIC,
        name: 'Claude 3.5 Haiku',
        description: 'Modelo rápido y económico de Anthropic',
        maxTokens: 8192,
        supportsStreaming: true,
        costPer1kTokens: 0.0008,
        enabled: true
    },

    // OpenAI
    'gpt-4o': {
        provider: PROVIDERS.OPENAI,
        name: 'GPT-4o',
        description: 'Modelo optimizado de OpenAI',
        maxTokens: 128000,
        supportsStreaming: true,
        costPer1kTokens: 0.005,
        enabled: true
    },
    'gpt-4-turbo': {
        provider: PROVIDERS.OPENAI,
        name: 'GPT-4 Turbo',
        description: 'GPT-4 con mayor contexto',
        maxTokens: 128000,
        supportsStreaming: true,
        costPer1kTokens: 0.01,
        enabled: true
    },
    'gpt-3.5-turbo': {
        provider: PROVIDERS.OPENAI,
        name: 'GPT-3.5 Turbo',
        description: 'Modelo rápido y económico de OpenAI',
        maxTokens: 16385,
        supportsStreaming: true,
        costPer1kTokens: 0.0005,
        enabled: true
    },

    // Qwen (Alibaba Cloud)
    'qwen-max': {
        provider: PROVIDERS.QWEN,
        name: 'Qwen Max',
        description: 'Modelo más potente de Qwen',
        maxTokens: 8192,
        supportsStreaming: true,
        costPer1kTokens: 0.002,
        enabled: false, // Requiere configuración adicional
        requiresApiKey: 'QWEN_API_KEY'
    },
    'qwen-plus': {
        provider: PROVIDERS.QWEN,
        name: 'Qwen Plus',
        description: 'Modelo equilibrado de Qwen',
        maxTokens: 8192,
        supportsStreaming: true,
        costPer1kTokens: 0.001,
        enabled: false,
        requiresApiKey: 'QWEN_API_KEY'
    },

    // DeepSeek
    'deepseek-chat': {
        provider: PROVIDERS.DEEPSEEK,
        name: 'DeepSeek Chat',
        description: 'Modelo conversacional de DeepSeek',
        maxTokens: 8192,
        supportsStreaming: true,
        costPer1kTokens: 0.0001,
        enabled: false,
        requiresApiKey: 'DEEPSEEK_API_KEY'
    }
};

// ============================================
// INICIALIZACIÓN DE CLIENTES
// ============================================

const clients = {};

function initializeClients() {
    // Google Gemini
    if (process.env.GOOGLE_API_KEY) {
        clients[PROVIDERS.GOOGLE] = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    }

    // Anthropic Claude
    if (process.env.ANTHROPIC_API_KEY) {
        clients[PROVIDERS.ANTHROPIC] = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });
    }

    // OpenAI
    if (process.env.OPENAI_API_KEY) {
        clients[PROVIDERS.OPENAI] = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    // Qwen
    if (process.env.QWEN_API_KEY) {
        clients[PROVIDERS.QWEN] = new OpenAI({
            apiKey: process.env.QWEN_API_KEY,
            baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
        });
    }

    // DeepSeek
    if (process.env.DEEPSEEK_API_KEY) {
        clients[PROVIDERS.DEEPSEEK] = new OpenAI({
            apiKey: process.env.DEEPSEEK_API_KEY,
            baseURL: 'https://api.deepseek.com/v1'
        });
    }
}

// Inicializar clientes al cargar el módulo
initializeClients();

// ============================================
// EJECUTOR UNIVERSAL DE MODELOS
// ============================================

export async function executeModel(modelId, prompt, options = {}) {
    const startTime = Date.now();

    try {
        const modelConfig = MODEL_CATALOG[modelId];

        if (!modelConfig) {
            throw new Error(`Modelo no encontrado: ${modelId}`);
        }

        if (!modelConfig.enabled) {
            throw new Error(`Modelo deshabilitado: ${modelId}`);
        }

        const provider = modelConfig.provider;
        const client = clients[provider];

        if (!client) {
            throw new Error(`Cliente no inicializado para proveedor: ${provider}`);
        }

        log.debug('Ejecutando modelo', {
            module: 'model-master',
            modelId,
            provider,
            promptLength: prompt.length
        });

        let response;

        // Ejecutar según proveedor
        switch (provider) {
            case PROVIDERS.GOOGLE:
                response = await executeGoogle(client, modelId, prompt, options);
                break;

            case PROVIDERS.ANTHROPIC:
                response = await executeAnthropic(client, modelId, prompt, options);
                break;

            case PROVIDERS.OPENAI:
            case PROVIDERS.QWEN:
            case PROVIDERS.DEEPSEEK:
                response = await executeOpenAICompatible(client, modelId, prompt, options);
                break;

            default:
                throw new Error(`Proveedor no soportado: ${provider}`);
        }

        const executionTime = Date.now() - startTime;

        log.info('Modelo ejecutado exitosamente', {
            module: 'model-master',
            modelId,
            provider,
            executionTime,
            responseLength: response.length
        });

        return {
            response,
            modelId,
            provider,
            executionTime,
            tokensUsed: options.trackTokens ? estimateTokens(prompt + response) : null
        };

    } catch (error) {
        const executionTime = Date.now() - startTime;

        log.error('Error al ejecutar modelo', error, {
            module: 'model-master',
            modelId,
            executionTime
        });

        throw error;
    }
}

// ============================================
// EJECUTORES POR PROVEEDOR
// ============================================

async function executeGoogle(client, modelId, prompt, options) {
    const model = client.getGenerativeModel({ model: modelId });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

async function executeAnthropic(client, modelId, prompt, options) {
    const message = await client.messages.create({
        model: modelId,
        max_tokens: options.maxTokens || 8192,
        messages: [{
            role: 'user',
            content: prompt
        }]
    });
    return message.content[0].text;
}

async function executeOpenAICompatible(client, modelId, prompt, options) {
    const completion = await client.chat.completions.create({
        model: modelId,
        messages: [{
            role: 'user',
            content: prompt
        }],
        max_tokens: options.maxTokens || 8192,
        temperature: options.temperature || 0.7
    });
    return completion.choices[0].message.content;
}

// ============================================
// UTILIDADES
// ============================================

export function getAvailableModels() {
    return Object.entries(MODEL_CATALOG)
        .filter(([_, config]) => config.enabled)
        .map(([id, config]) => ({
            id,
            ...config
        }));
}

export function getDefaultModel() {
    const defaultModel = Object.entries(MODEL_CATALOG)
        .find(([_, config]) => config.isDefault);

    return defaultModel ? defaultModel[0] : 'gemini-2.5-flash';
}

export function getModelsByProvider(provider) {
    return Object.entries(MODEL_CATALOG)
        .filter(([_, config]) => config.provider === provider && config.enabled)
        .map(([id, config]) => ({ id, ...config }));
}

function estimateTokens(text) {
    // Estimación simple: ~4 caracteres por token
    return Math.ceil(text.length / 4);
}

// ============================================
// AGREGAR NUEVO MODELO DINÁMICAMENTE
// ============================================

export function registerModel(modelId, config) {
    MODEL_CATALOG[modelId] = {
        enabled: true,
        supportsStreaming: false,
        ...config
    };

    log.info('Nuevo modelo registrado', {
        module: 'model-master',
        modelId,
        provider: config.provider
    });
}
