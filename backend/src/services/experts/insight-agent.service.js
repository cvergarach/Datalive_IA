import { createClient } from '@supabase/supabase-js';
import { log } from '../../utils/logger.js';
import { executeAI, TASK_TYPES } from '../ai-orchestrator.service.js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * Agente Generador de Insights
 * Analiza datos de ejecuciones y genera insights de negocio
 */
export async function generateInsights(projectId, userId) {
    try {
        log.info('Generando insights', {
            module: 'insight-agent',
            userId,
            projectId
        });

        // Obtener todas las ejecuciones del proyecto
        const { data: executions } = await supabase
            .from('executions')
            .select('*, apis!inner(project_id)')
            .eq('apis.project_id', projectId)
            .eq('status', 'success')
            .order('created_at', { ascending: false })
            .limit(100);

        if (!executions || executions.length === 0) {
            return [];
        }

        // Obtener información del proyecto
        const { data: project } = await supabase
            .from('projects')
            .select('industry')
            .eq('id', projectId)
            .single();

        const prompt = `Eres un analista de datos experto. Analiza los siguientes datos de ejecuciones de API y genera insights de negocio.

INDUSTRIA: ${project?.industry || 'general'}

DATOS DE EJECUCIONES:
${executions.map(ex => `
Endpoint: ${ex.endpoint}
Método: ${ex.method}
Datos obtenidos: ${JSON.stringify(ex.response_data).substring(0, 500)}
`).join('\n---\n')}

TAREA: Genera 5-10 insights de negocio en formato JSON:
{
  "insights": [
    {
      "title": "Título del insight",
      "description": "Descripción detallada",
      "category": "trend|pattern|recommendation|alert",
      "priority": "low|medium|high|critical",
      "data": {
        "metric": "nombre de la métrica",
        "value": "valor encontrado",
        "comparison": "comparación o contexto"
      },
      "recommendations": ["Recomendación 1", "Recomendación 2"]
    }
  ]
}

Enfócate en:
1. Tendencias identificadas
2. Patrones en los datos
3. Oportunidades de mejora
4. Alertas o problemas detectados
5. Recomendaciones accionables

Usa lenguaje de negocios, no técnico.`;

        const { response, model } = await executeAI(
            prompt,
            userId,
            TASK_TYPES.INSIGHT_GENERATION,
            projectId
        );

        // Parsear respuesta
        let insightsData;
        try {
            let clean = response.trim();
            if (clean.startsWith('```json')) {
                clean = clean.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            insightsData = JSON.parse(clean);
        } catch (e) {
            log.error('Error al parsear insights', e, {
                module: 'insight-agent',
                userId,
                projectId
            });
            throw new Error('No se pudieron generar insights válidos');
        }

        // Guardar insights en BD
        const savedInsights = [];
        for (const insight of insightsData.insights) {
            const { data: saved } = await supabase
                .from('insights')
                .insert({
                    project_id: projectId,
                    title: insight.title,
                    description: insight.description,
                    category: insight.category,
                    priority: insight.priority,
                    data: insight,
                    ai_model: model
                })
                .select()
                .single();

            if (saved) {
                savedInsights.push(saved);
            }
        }

        log.info('Insights generados y guardados', {
            module: 'insight-agent',
            userId,
            projectId,
            count: savedInsights.length,
            model
        });

        return savedInsights;
    } catch (error) {
        log.error('Error al generar insights', error, {
            module: 'insight-agent',
            userId,
            projectId
        });
        throw error;
    }
}

/**
 * Generar insight específico sobre un tema
 */
export async function generateSpecificInsight(projectId, topic, userId) {
    try {
        const prompt = `Genera un insight específico sobre: ${topic}

Analiza los datos disponibles del proyecto y proporciona:
1. Análisis del tema
2. Hallazgos clave
3. Recomendaciones

Responde en formato JSON con la estructura de insight.`;

        const { response } = await executeAI(
            prompt,
            userId,
            TASK_TYPES.INSIGHT_GENERATION,
            projectId
        );

        return JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
    } catch (error) {
        log.error('Error al generar insight específico', error, {
            module: 'insight-agent',
            userId,
            projectId
        });
        throw error;
    }
}
