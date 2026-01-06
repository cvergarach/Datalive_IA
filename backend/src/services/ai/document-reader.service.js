import { createClient } from '@supabase/supabase-js';
import { log } from '../../utils/logger.js';
import { executeAI, TASK_TYPES } from '../ai-orchestrator.service.js';
import { getIndustryExpert } from '../industry-experts/index.js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * IA 1: Lector de Documentación de APIs
 * Analiza documentación técnica y descubre APIs, endpoints, parámetros, etc.
 */
export async function analyzeDocument(documentId, textContent, userId, projectId) {
    try {
        log.info('Iniciando análisis de documento', {
            module: 'document-reader',
            userId,
            projectId,
            documentId,
            contentLength: textContent.length
        });

        // Actualizar estado del documento
        await supabase
            .from('documents')
            .update({ status: 'analyzing' })
            .eq('id', documentId);

        // Obtener información del proyecto para contexto de industria
        const { data: project } = await supabase
            .from('projects')
            .select('industry')
            .eq('id', projectId)
            .single();

        const industry = project?.industry || 'general';

        // Obtener experto de industria
        const expert = getIndustryExpert(industry);
        const industryContext = expert.getContext();

        // Construir prompt
        const prompt = `Eres un experto en análisis de documentación técnica de APIs.

CONTEXTO DE INDUSTRIA: ${industry.toUpperCase()}
${industryContext}

Tu tarea es analizar la siguiente documentación y extraer:

1. **APIs Descubiertas**: Identifica todas las APIs mencionadas
   - Nombre de la API
   - URL base
   - Descripción breve
   - Tipo de autenticación mencionada

2. **Endpoints**: Para cada API, lista todos los endpoints encontrados
   - Método HTTP (GET, POST, PUT, DELETE, etc.)
   - Ruta del endpoint
   - Descripción
   - Parámetros requeridos (query, path, body)
   - Parámetros opcionales
   - Estructura de respuesta esperada
   - Códigos de estado HTTP

3. **Autenticación**: Identifica métodos de autenticación
   - Tipo (API Key, OAuth, JWT, Basic Auth, etc.)
   - Dónde se envían las credenciales (header, query, body)
   - Nombres de campos de credenciales

4. **Modelos de Datos**: Estructuras de datos mencionadas
   - Nombre del modelo
   - Campos y tipos
   - Relaciones

DOCUMENTACIÓN A ANALIZAR:
${textContent}

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido en el siguiente formato:
{
  "apis": [
    {
      "name": "Nombre de la API",
      "baseUrl": "https://api.example.com",
      "description": "Descripción",
      "authType": "api_key|oauth|jwt|basic|none",
      "endpoints": [
        {
          "method": "GET",
          "path": "/users",
          "description": "Obtener usuarios",
          "requiredParams": [
            {"name": "limit", "type": "query", "dataType": "number"}
          ],
          "optionalParams": [],
          "responseStructure": {},
          "statusCodes": [200, 400, 401, 500]
        }
      ]
    }
  ],
  "authDetails": {
    "type": "api_key",
    "location": "header",
    "fieldName": "X-API-Key",
    "additionalInfo": ""
  },
  "dataModels": [
    {
      "name": "User",
      "fields": [
        {"name": "id", "type": "string"},
        {"name": "email", "type": "string"}
      ]
    }
  ]
}`;

        // Ejecutar IA
        const { response, model, executionTime } = await executeAI(
            prompt,
            userId,
            TASK_TYPES.DOCUMENT_ANALYSIS,
            projectId
        );

        log.debug('Respuesta de IA recibida', {
            module: 'document-reader',
            userId,
            projectId,
            documentId,
            model,
            executionTime
        });

        // Parsear respuesta JSON
        let analysisResult;
        try {
            // Limpiar respuesta (remover markdown si existe)
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.replace(/```\n?/g, '');
            }

            analysisResult = JSON.parse(cleanResponse);
        } catch (parseError) {
            log.error('Error al parsear respuesta JSON de IA', parseError, {
                module: 'document-reader',
                userId,
                projectId,
                documentId,
                response: response.substring(0, 500)
            });
            throw new Error('La IA no devolvió un JSON válido');
        }

        // Guardar APIs descubiertas en la base de datos
        if (analysisResult.apis && analysisResult.apis.length > 0) {
            for (const api of analysisResult.apis) {
                const { data: savedApi, error: apiError } = await supabase
                    .from('apis')
                    .insert({
                        project_id: projectId,
                        document_id: documentId,
                        name: api.name,
                        base_url: api.baseUrl,
                        description: api.description,
                        auth_type: api.authType,
                        endpoints: api.endpoints
                    })
                    .select()
                    .single();

                if (apiError) {
                    log.error('Error al guardar API', apiError, {
                        module: 'document-reader',
                        userId,
                        projectId,
                        apiName: api.name
                    });
                } else {
                    log.info('API guardada exitosamente', {
                        module: 'document-reader',
                        userId,
                        projectId,
                        apiId: savedApi.id,
                        apiName: api.name,
                        endpointsCount: api.endpoints.length
                    });
                }
            }
        }

        // Actualizar documento con resultado
        await supabase
            .from('documents')
            .update({
                status: 'completed',
                analysis_result: analysisResult
            })
            .eq('id', documentId);

        log.info('Análisis de documento completado', {
            module: 'document-reader',
            userId,
            projectId,
            documentId,
            apisFound: analysisResult.apis?.length || 0,
            model,
            executionTime
        });

        return analysisResult;
    } catch (error) {
        log.error('Error en análisis de documento', error, {
            module: 'document-reader',
            userId,
            projectId,
            documentId
        });

        // Actualizar estado del documento a fallido
        await supabase
            .from('documents')
            .update({ status: 'failed' })
            .eq('id', documentId);

        throw error;
    }
}
