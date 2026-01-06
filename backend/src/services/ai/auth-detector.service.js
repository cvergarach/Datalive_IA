import { createClient } from '@supabase/supabase-js';
import { log } from '../../utils/logger.js';
import { executeAI, TASK_TYPES } from '../ai-orchestrator.service.js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * IA 2: Detector de Autenticación y Credenciales
 * Analiza cómo autenticarse en una API y qué credenciales se necesitan
 */
export async function detectAuthenticationMethod(apiId, documentText, userId) {
    try {
        log.info('Detectando método de autenticación', {
            module: 'auth-detector',
            userId,
            apiId
        });

        const prompt = `Eres un experto en autenticación de APIs.

Analiza la siguiente documentación y determina:

1. **Tipo de autenticación**: API Key, OAuth 2.0, JWT, Basic Auth, Bearer Token, etc.
2. **Ubicación de las credenciales**: Header, Query Parameter, Body
3. **Nombres de campos exactos**: Ej: "X-API-Key", "Authorization", "api_key", "token"
4. **Formato requerido**: Ej: "Bearer {token}", "Basic {base64}", solo el valor
5. **Credenciales necesarias**: Lista de qué debe proporcionar el usuario
6. **Flujo de autenticación**: Si necesita login previo, refresh tokens, etc.

DOCUMENTACIÓN:
${documentText}

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido:
{
  "authType": "api_key|oauth|jwt|basic|bearer|none",
  "location": "header|query|body",
  "fieldName": "nombre exacto del campo",
  "format": "formato exacto (ej: Bearer {value})",
  "credentialsNeeded": [
    {
      "name": "api_key",
      "label": "API Key",
      "description": "Tu clave de API",
      "type": "text|password",
      "required": true
    }
  ],
  "authFlow": {
    "requiresLogin": false,
    "loginEndpoint": "/auth/login",
    "tokenField": "access_token",
    "refreshable": false
  },
  "examples": [
    "Authorization: Bearer abc123",
    "X-API-Key: your-key-here"
  ]
}`;

        const { response, model } = await executeAI(
            prompt,
            userId,
            TASK_TYPES.AUTH_DETECTION
        );

        // Parsear respuesta
        let authDetails;
        try {
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.replace(/```\n?/g, '');
            }
            authDetails = JSON.parse(cleanResponse);
        } catch (parseError) {
            log.error('Error al parsear respuesta de detección de auth', parseError, {
                module: 'auth-detector',
                userId,
                apiId
            });
            throw new Error('La IA no devolvió un JSON válido');
        }

        // Actualizar API con detalles de autenticación
        await supabase
            .from('apis')
            .update({
                auth_type: authDetails.authType,
                auth_details: authDetails
            })
            .eq('id', apiId);

        log.info('Método de autenticación detectado', {
            module: 'auth-detector',
            userId,
            apiId,
            authType: authDetails.authType,
            model
        });

        return authDetails;
    } catch (error) {
        log.error('Error en detección de autenticación', error, {
            module: 'auth-detector',
            userId,
            apiId
        });
        throw error;
    }
}

/**
 * Guardar credenciales del usuario para una API
 * Las credenciales se guardan encriptadas (en producción usar crypto)
 */
export async function saveCredentials(apiId, credentials, userId) {
    try {
        log.info('Guardando credenciales', {
            module: 'auth-detector',
            userId,
            apiId,
            credentialKeys: Object.keys(credentials)
        });

        // Eliminar credenciales anteriores
        await supabase
            .from('credentials')
            .delete()
            .eq('api_id', apiId);

        // Guardar nuevas credenciales
        const credentialRecords = Object.entries(credentials).map(([key, value]) => ({
            api_id: apiId,
            key,
            value, // TODO: Encriptar en producción
            description: `Credencial ${key}`
        }));

        const { error } = await supabase
            .from('credentials')
            .insert(credentialRecords);

        if (error) throw error;

        log.info('Credenciales guardadas exitosamente', {
            module: 'auth-detector',
            userId,
            apiId,
            count: credentialRecords.length
        });

        return true;
    } catch (error) {
        log.error('Error al guardar credenciales', error, {
            module: 'auth-detector',
            userId,
            apiId
        });
        throw error;
    }
}

/**
 * Obtener credenciales guardadas para una API
 */
export async function getCredentials(apiId) {
    try {
        const { data: credentials, error } = await supabase
            .from('credentials')
            .select('key, value')
            .eq('api_id', apiId);

        if (error) throw error;

        // Convertir array a objeto
        const credentialsObj = {};
        credentials.forEach(cred => {
            credentialsObj[cred.key] = cred.value;
        });

        return credentialsObj;
    } catch (error) {
        log.error('Error al obtener credenciales', error, {
            module: 'auth-detector',
            apiId
        });
        throw error;
    }
}
