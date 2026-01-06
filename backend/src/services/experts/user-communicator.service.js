import { createClient } from '@supabase/supabase-js';
import { log } from '../../utils/logger.js';
import { executeAI, TASK_TYPES } from '../ai-orchestrator.service.js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * Agente Comunicador con el Usuario
 * Explica en lenguaje simple lo que se encontró y qué se necesita
 */

/**
 * Explicar al usuario qué APIs se encontraron
 */
export async function explainDiscoveredAPIs(apiId, userId) {
    try {
        log.info('Generando explicación de APIs descubiertas', {
            module: 'user-communicator',
            userId,
            apiId
        });

        // Obtener información de la API
        const { data: api } = await supabase
            .from('apis')
            .select('*')
            .eq('id', apiId)
            .single();

        if (!api) {
            throw new Error('API no encontrada');
        }

        const prompt = `Eres un asistente que explica APIs en lenguaje muy simple para usuarios sin conocimientos técnicos.

API ENCONTRADA:
Nombre: ${api.name}
URL Base: ${api.base_url}
Descripción: ${api.description}
Número de endpoints: ${api.endpoints?.length || 0}

Endpoints encontrados:
${api.endpoints?.map((ep, i) => `${i + 1}. ${ep.method} ${ep.path} - ${ep.description}`).join('\n')}

TAREA: Explica en español simple:
1. Qué es esta API y para qué sirve
2. Qué cosas se pueden hacer con ella (sin usar términos técnicos)
3. Qué información se puede obtener

Usa ejemplos concretos y lenguaje cotidiano. Máximo 4 párrafos.`;

        const { response } = await executeAI(prompt, userId, TASK_TYPES.API_EXECUTION);

        return response;
    } catch (error) {
        log.error('Error al explicar APIs', error, {
            module: 'user-communicator',
            userId,
            apiId
        });
        throw error;
    }
}

/**
 * Solicitar credenciales al usuario en lenguaje simple
 */
export async function requestCredentials(apiId, authDetails, userId) {
    try {
        log.info('Solicitando credenciales al usuario', {
            module: 'user-communicator',
            userId,
            apiId
        });

        const prompt = `Eres un asistente que ayuda a usuarios a configurar APIs.

TIPO DE AUTENTICACIÓN DETECTADO:
${JSON.stringify(authDetails, null, 2)}

TAREA: Explica al usuario en español muy simple:
1. Qué credenciales necesita proporcionar
2. Dónde puede encontrar estas credenciales (generalmente)
3. Por qué son necesarias

Usa lenguaje cotidiano, sin términos técnicos como "header", "bearer", "token", etc.
Máximo 3 párrafos.

Ejemplo de buena explicación:
"Para usar esta API, necesitas una clave especial que te identifica. Es como una contraseña que te da acceso. Normalmente puedes encontrar esta clave en la configuración de tu cuenta en el sitio web del servicio. Una vez que la ingreses aquí, la guardaremos de forma segura y no tendrás que volver a ingresarla."`;

        const { response } = await executeAI(prompt, userId, TASK_TYPES.API_EXECUTION);

        return {
            explanation: response,
            credentialsNeeded: authDetails.credentialsNeeded,
            simpleLabels: authDetails.credentialsNeeded.map(cred => ({
                name: cred.name,
                label: simplifyLabel(cred.label),
                placeholder: generatePlaceholder(cred.name),
                type: cred.type === 'password' ? 'password' : 'text'
            }))
        };
    } catch (error) {
        log.error('Error al solicitar credenciales', error, {
            module: 'user-communicator',
            userId,
            apiId
        });
        throw error;
    }
}

/**
 * Simplificar etiquetas técnicas a lenguaje común
 */
function simplifyLabel(label) {
    const simplifications = {
        'API Key': 'Tu clave de acceso',
        'Access Token': 'Tu código de acceso',
        'Bearer Token': 'Tu código de autorización',
        'Client ID': 'Tu identificador de aplicación',
        'Client Secret': 'Tu clave secreta',
        'Username': 'Tu nombre de usuario',
        'Password': 'Tu contraseña',
        'API Secret': 'Tu clave secreta'
    };

    return simplifications[label] || label;
}

/**
 * Generar placeholder amigable
 */
function generatePlaceholder(fieldName) {
    const placeholders = {
        'api_key': 'Ej: sk_live_abc123...',
        'access_token': 'Ej: eyJhbGc...',
        'client_id': 'Ej: app_123456',
        'client_secret': 'Ej: secret_abc123',
        'username': 'tu-usuario',
        'password': '••••••••'
    };

    return placeholders[fieldName] || 'Ingresa aquí';
}

/**
 * Explicar qué hace cada endpoint en lenguaje simple
 */
export async function explainEndpoint(endpoint, userId) {
    try {
        const prompt = `Explica en español muy simple qué hace este endpoint de API:

Método: ${endpoint.method}
Ruta: ${endpoint.path}
Descripción técnica: ${endpoint.description}

Parámetros que acepta:
${endpoint.requiredParams?.map(p => `- ${p.name}: ${p.description || 'Sin descripción'}`).join('\n') || 'Ninguno'}

TAREA: Explica en 2-3 oraciones:
1. Qué hace esta función
2. Qué información necesita
3. Qué información devuelve

Usa lenguaje cotidiano, como si le explicaras a alguien que no sabe de programación.
No uses palabras como "endpoint", "request", "response", "parámetro".

Ejemplo de buena explicación:
"Esta función te permite consultar la lista de usuarios registrados en el sistema. Puedes especificar cuántos usuarios quieres ver a la vez. Te devolverá la información de cada usuario, como su nombre y correo electrónico."`;

        const { response } = await executeAI(prompt, userId, TASK_TYPES.API_EXECUTION);

        return response;
    } catch (error) {
        log.error('Error al explicar endpoint', error, {
            module: 'user-communicator',
            userId
        });
        throw error;
    }
}

/**
 * Solicitar parámetros al usuario en lenguaje simple
 */
export async function requestParameters(endpoint, userId) {
    try {
        if (!endpoint.requiredParams || endpoint.requiredParams.length === 0) {
            return {
                message: 'Esta función no necesita información adicional. Puedes ejecutarla directamente.',
                parameters: []
            };
        }

        const prompt = `Explica qué información necesita el usuario proporcionar para ejecutar esta función:

Función: ${endpoint.description}

Información necesaria:
${endpoint.requiredParams.map(p => `- ${p.name} (${p.dataType}): ${p.description || 'Sin descripción'}`).join('\n')}

TAREA: Para cada campo, explica en lenguaje simple:
1. Qué es
2. Para qué se usa
3. Un ejemplo de valor

Responde en formato JSON:
{
  "message": "Explicación general de qué información se necesita",
  "parameters": [
    {
      "name": "nombre_tecnico",
      "label": "Etiqueta simple",
      "explanation": "Explicación simple",
      "example": "Ejemplo de valor",
      "type": "text|number|date"
    }
  ]
}`;

        const { response } = await executeAI(prompt, userId, TASK_TYPES.API_EXECUTION);

        let parsed;
        try {
            let clean = response.trim();
            if (clean.startsWith('```json')) {
                clean = clean.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            parsed = JSON.parse(clean);
        } catch (e) {
            // Fallback manual
            parsed = {
                message: 'Necesitamos algunos datos para ejecutar esta función.',
                parameters: endpoint.requiredParams.map(p => ({
                    name: p.name,
                    label: p.name,
                    explanation: p.description || 'Información necesaria',
                    example: '',
                    type: p.dataType === 'number' ? 'number' : 'text'
                }))
            };
        }

        return parsed;
    } catch (error) {
        log.error('Error al solicitar parámetros', error, {
            module: 'user-communicator',
            userId
        });
        throw error;
    }
}

/**
 * Generar resumen ejecutivo de todas las ejecuciones
 */
export async function generateExecutiveSummary(executions, userId, projectId) {
    try {
        log.info('Generando resumen ejecutivo', {
            module: 'user-communicator',
            userId,
            projectId,
            executionsCount: executions.length
        });

        const prompt = `Genera un resumen ejecutivo en español de las siguientes ejecuciones de API:

${executions.map((ex, i) => `
${i + 1}. ${ex.method} ${ex.endpoint}
   Estado: ${ex.status}
   Respuesta: ${JSON.stringify(ex.response_data).substring(0, 200)}...
`).join('\n')}

TAREA: Crea un resumen ejecutivo que incluya:
1. Resumen general de qué se hizo
2. Principales hallazgos o resultados
3. Métricas clave encontradas
4. Recomendaciones o insights

Usa lenguaje de negocios, no técnico. Máximo 5 párrafos.`;

        const { response } = await executeAI(prompt, userId, TASK_TYPES.REPORT_GENERATION, projectId);

        return response;
    } catch (error) {
        log.error('Error al generar resumen ejecutivo', error, {
            module: 'user-communicator',
            userId,
            projectId
        });
        throw error;
    }
}
