import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { log } from '../../utils/logger.js';
import { executeAI, TASK_TYPES } from '../ai-orchestrator.service.js';
import { getCredentials } from './auth-detector.service.js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * IA 3: Ejecutor Universal de APIs
 * Ejecuta cualquier endpoint automáticamente, manejando autenticación y parámetros
 */
export async function executeEndpoint(apiId, endpoint, userParams, userId, projectId) {
    try {
        log.info('Iniciando ejecución de endpoint', {
            module: 'api-executor',
            userId,
            projectId,
            apiId,
            endpoint: endpoint.path,
            method: endpoint.method
        });

        // 1. Obtener información de la API
        const { data: api } = await supabase
            .from('apis')
            .select('*, auth_details')
            .eq('id', apiId)
            .single();

        if (!api) {
            throw new Error('API no encontrada');
        }

        // 2. Obtener credenciales guardadas
        const credentials = await getCredentials(apiId);

        log.debug('Credenciales obtenidas', {
            module: 'api-executor',
            userId,
            apiId,
            hasCredentials: Object.keys(credentials).length > 0
        });

        // 3. Construir headers de autenticación
        const headers = await buildAuthHeaders(api, credentials);

        // 4. Inferir parámetros faltantes con IA si es necesario
        const finalParams = await inferMissingParams(
            endpoint,
            userParams,
            userId,
            projectId
        );

        // 5. Construir URL completa
        const url = buildUrl(api.base_url, endpoint.path, finalParams.query);

        // 6. Ejecutar request
        const startTime = Date.now();
        let response;

        try {
            response = await axios({
                method: endpoint.method,
                url,
                headers,
                data: finalParams.body,
                timeout: 30000
            });
        } catch (error) {
            // Capturar error de la API
            response = {
                status: error.response?.status || 500,
                data: error.response?.data || { error: error.message },
                error: true
            };
        }

        const responseTime = Date.now() - startTime;

        log.info('Endpoint ejecutado', {
            module: 'api-executor',
            userId,
            apiId,
            endpoint: endpoint.path,
            status: response.status,
            responseTime
        });

        // 7. Generar explicación con IA
        const explanation = await generateExplanation(
            endpoint,
            finalParams,
            response,
            userId,
            projectId
        );

        // 8. Guardar ejecución en BD
        const { data: execution } = await supabase
            .from('executions')
            .insert({
                api_id: apiId,
                endpoint: endpoint.path,
                method: endpoint.method,
                request_params: finalParams,
                request_headers: headers,
                request_body: finalParams.body,
                response_status: response.status,
                response_data: response.data,
                response_time: responseTime,
                status: response.error ? 'failed' : 'success',
                error_message: response.error ? response.data?.error || 'Error desconocido' : null,
                ai_explanation: explanation
            })
            .select()
            .single();

        return {
            execution,
            response: response.data,
            status: response.status,
            explanation,
            responseTime
        };

    } catch (error) {
        log.error('Error en ejecución de endpoint', error, {
            module: 'api-executor',
            userId,
            apiId,
            endpoint: endpoint?.path
        });
        throw error;
    }
}

/**
 * Construir headers de autenticación según el tipo
 */
async function buildAuthHeaders(api, credentials) {
    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'DataLIVE/1.0'
    };

    if (!api.auth_details || api.auth_type === 'none') {
        return headers;
    }

    const { authType, location, fieldName, format } = api.auth_details;

    if (location === 'header') {
        let value = credentials[Object.keys(credentials)[0]]; // Primera credencial

        // Aplicar formato si existe
        if (format && format.includes('{value}')) {
            value = format.replace('{value}', value);
        } else if (format && format.includes('{token}')) {
            value = format.replace('{token}', value);
        }

        headers[fieldName] = value;
    }

    return headers;
}

/**
 * Construir URL completa con query parameters
 */
function buildUrl(baseUrl, path, queryParams = {}) {
    let url = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    url += path.startsWith('/') ? path : `/${path}`;

    const params = new URLSearchParams(queryParams);
    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    return url;
}

/**
 * Inferir parámetros faltantes usando IA
 */
async function inferMissingParams(endpoint, userParams, userId, projectId) {
    const finalParams = {
        query: {},
        body: {},
        path: {}
    };

    // Separar parámetros por tipo
    endpoint.requiredParams?.forEach(param => {
        if (userParams[param.name]) {
            if (param.type === 'query') {
                finalParams.query[param.name] = userParams[param.name];
            } else if (param.type === 'body') {
                finalParams.body[param.name] = userParams[param.name];
            } else if (param.type === 'path') {
                finalParams.path[param.name] = userParams[param.name];
            }
        }
    });

    // Si faltan parámetros requeridos, usar IA para inferirlos
    const missingParams = endpoint.requiredParams?.filter(
        param => !userParams[param.name]
    ) || [];

    if (missingParams.length > 0) {
        log.info('Infiriendo parámetros faltantes con IA', {
            module: 'api-executor',
            userId,
            missingParams: missingParams.map(p => p.name)
        });

        const prompt = `Necesito valores razonables para estos parámetros de API:

Endpoint: ${endpoint.method} ${endpoint.path}
Descripción: ${endpoint.description}

Parámetros faltantes:
${missingParams.map(p => `- ${p.name} (${p.dataType}): ${p.description || 'Sin descripción'}`).join('\n')}

Proporciona valores de ejemplo razonables en JSON:
{
  "param1": "valor1",
  "param2": "valor2"
}`;

        try {
            const { response } = await executeAI(prompt, userId, TASK_TYPES.API_EXECUTION, projectId);
            let inferredParams = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

            // Agregar parámetros inferidos
            Object.entries(inferredParams).forEach(([key, value]) => {
                const param = missingParams.find(p => p.name === key);
                if (param) {
                    if (param.type === 'query') {
                        finalParams.query[key] = value;
                    } else if (param.type === 'body') {
                        finalParams.body[key] = value;
                    }
                }
            });
        } catch (error) {
            log.warn('No se pudieron inferir parámetros', {
                module: 'api-executor',
                error: error.message
            });
        }
    }

    return finalParams;
}

/**
 * Generar explicación en lenguaje simple de la respuesta
 */
async function generateExplanation(endpoint, params, response, userId, projectId) {
    try {
        const prompt = `Explica en español simple y claro qué hizo esta llamada a la API y qué significa la respuesta.

ENDPOINT: ${endpoint.method} ${endpoint.path}
DESCRIPCIÓN: ${endpoint.description}

PARÁMETROS ENVIADOS:
${JSON.stringify(params, null, 2)}

RESPUESTA (Status ${response.status}):
${JSON.stringify(response.data, null, 2).substring(0, 1000)}

Genera una explicación de máximo 3 párrafos que un usuario sin conocimientos técnicos pueda entender.
Incluye:
1. Qué se solicitó
2. Qué respondió la API
3. Qué significa en términos de negocio

Responde en texto plano, sin formato especial.`;

        const { response: explanation } = await executeAI(
            prompt,
            userId,
            TASK_TYPES.API_EXECUTION,
            projectId
        );

        return explanation;
    } catch (error) {
        log.error('Error al generar explicación', error, {
            module: 'api-executor'
        });
        return 'No se pudo generar una explicación para esta ejecución.';
    }
}

/**
 * Ejecutar todos los endpoints de una API automáticamente
 */
export async function executeAllEndpoints(apiId, userId, projectId) {
    try {
        log.info('Ejecutando todos los endpoints de la API', {
            module: 'api-executor',
            userId,
            apiId
        });

        const { data: api } = await supabase
            .from('apis')
            .select('*')
            .eq('id', apiId)
            .single();

        if (!api || !api.endpoints) {
            throw new Error('API no encontrada o sin endpoints');
        }

        const results = [];

        // Ejecutar cada endpoint
        for (const endpoint of api.endpoints) {
            try {
                const result = await executeEndpoint(apiId, endpoint, {}, userId, projectId);
                results.push({
                    endpoint: endpoint.path,
                    success: true,
                    result
                });
            } catch (error) {
                results.push({
                    endpoint: endpoint.path,
                    success: false,
                    error: error.message
                });
            }
        }

        log.info('Ejecución masiva completada', {
            module: 'api-executor',
            userId,
            apiId,
            total: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
        });

        return results;
    } catch (error) {
        log.error('Error en ejecución masiva', error, {
            module: 'api-executor',
            userId,
            apiId
        });
        throw error;
    }
}
