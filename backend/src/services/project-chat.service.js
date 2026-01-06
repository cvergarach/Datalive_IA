import { executeModel, getAvailableModels, getDefaultModel } from './model-master.service.js';
import { createClient } from '@supabase/supabase-js';
import { log } from '../utils/logger.js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * Chat Conversacional con Información del Proyecto
 * Permite conversar con toda la información encontrada
 */

export async function chatWithProject(projectId, userMessage, userId, conversationHistory = []) {
    try {
        log.info('Iniciando chat con proyecto', {
            module: 'project-chat',
            userId,
            projectId,
            messageLength: userMessage.length
        });

        // Obtener contexto completo del proyecto
        const context = await getProjectContext(projectId);

        // Construir prompt con contexto
        const prompt = buildChatPrompt(context, conversationHistory, userMessage);

        // Obtener modelo preferido del usuario o usar default
        const modelId = await getUserPreferredModel(userId, 'chat') || getDefaultModel();

        // Ejecutar modelo
        const { response, executionTime } = await executeModel(modelId, prompt);

        // Guardar mensaje en historial
        await saveConversation(projectId, userId, userMessage, response, modelId);

        log.info('Chat completado', {
            module: 'project-chat',
            userId,
            projectId,
            modelId,
            executionTime
        });

        return {
            response,
            modelUsed: modelId,
            executionTime,
            context: {
                apisCount: context.apis.length,
                executionsCount: context.executions.length,
                insightsCount: context.insights.length
            }
        };

    } catch (error) {
        log.error('Error en chat con proyecto', error, {
            module: 'project-chat',
            userId,
            projectId
        });
        throw error;
    }
}

/**
 * Obtener todo el contexto del proyecto
 */
async function getProjectContext(projectId) {
    // Obtener proyecto
    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    // Obtener APIs descubiertas
    const { data: apis } = await supabase
        .from('apis')
        .select('*')
        .eq('project_id', projectId);

    // Obtener ejecuciones
    const { data: executions } = await supabase
        .from('executions')
        .select('*')
        .in('api_id', apis?.map(a => a.id) || [])
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(50);

    // Obtener insights
    const { data: insights } = await supabase
        .from('insights')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(20);

    // Obtener documentos
    const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId);

    return {
        project,
        apis: apis || [],
        executions: executions || [],
        insights: insights || [],
        documents: documents || []
    };
}

/**
 * Construir prompt para el chat
 */
function buildChatPrompt(context, history, userMessage) {
    return `Eres un asistente experto que ayuda a usuarios a entender y trabajar con sus proyectos de APIs.

CONTEXTO DEL PROYECTO:
Nombre: ${context.project.name}
Descripción: ${context.project.description}
Industria: ${context.project.industry}

APIs DESCUBIERTAS (${context.apis.length}):
${context.apis.slice(0, 5).map(api => `
- ${api.name}: ${api.description}
  URL: ${api.base_url}
  Endpoints: ${api.endpoints?.length || 0}
`).join('\n')}

EJECUCIONES RECIENTES (${context.executions.length}):
${context.executions.slice(0, 10).map(ex => `
- ${ex.method} ${ex.endpoint}: ${ex.ai_explanation?.substring(0, 100)}...
`).join('\n')}

INSIGHTS GENERADOS (${context.insights.length}):
${context.insights.slice(0, 5).map(ins => `
- ${ins.title}: ${ins.description?.substring(0, 100)}...
`).join('\n')}

HISTORIAL DE CONVERSACIÓN:
${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

PREGUNTA DEL USUARIO:
${userMessage}

INSTRUCCIONES:
- Responde en español de forma clara y concisa
- Usa la información del contexto para dar respuestas precisas
- Si no tienes información suficiente, dilo claramente
- Sugiere acciones que el usuario puede tomar
- Sé amigable y útil

RESPUESTA:`;
}

/**
 * Guardar conversación en BD
 */
async function saveConversation(projectId, userId, userMessage, aiResponse, modelId) {
    try {
        await supabase
            .from('conversations')
            .insert({
                project_id: projectId,
                user_id: userId,
                user_message: userMessage,
                ai_response: aiResponse,
                model_used: modelId
            });
    } catch (error) {
        log.warn('Error al guardar conversación', {
            module: 'project-chat',
            error: error.message
        });
    }
}

/**
 * Obtener modelo preferido del usuario
 */
async function getUserPreferredModel(userId, taskType) {
    try {
        const { data } = await supabase
            .from('ai_model_preferences')
            .select('model')
            .eq('user_id', userId)
            .eq('task_type', taskType)
            .single();

        return data?.model;
    } catch (error) {
        return null;
    }
}

/**
 * Obtener historial de conversación
 */
export async function getConversationHistory(projectId, limit = 10) {
    const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(limit);

    return data || [];
}
