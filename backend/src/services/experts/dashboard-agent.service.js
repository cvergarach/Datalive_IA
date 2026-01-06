import { createClient } from '@supabase/supabase-js';
import { log } from '../../utils/logger.js';
import { executeAI, TASK_TYPES } from '../ai-orchestrator.service.js';
import { getIndustryExpert } from '../industry-experts/index.js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * Agente Generador de Dashboards
 * Crea dashboards interactivos con la información de las APIs
 */
export async function generateDashboard(projectId, userId) {
    try {
        log.info('Generando dashboard', {
            module: 'dashboard-agent',
            userId,
            projectId
        });

        // Obtener información del proyecto
        const { data: project } = await supabase
            .from('projects')
            .select('industry')
            .eq('id', projectId)
            .single();

        // Obtener experto de industria
        const expert = getIndustryExpert(project?.industry || 'general');
        const kpis = expert.getKPIs();

        // Obtener ejecuciones del proyecto
        const { data: executions } = await supabase
            .from('executions')
            .select('*, apis!inner(project_id)')
            .eq('apis.project_id', projectId)
            .eq('status', 'success')
            .order('created_at', { ascending: false })
            .limit(100);

        // Obtener insights del proyecto
        const { data: insights } = await supabase
            .from('insights')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })
            .limit(10);

        const prompt = `Eres un experto en visualización de datos y dashboards. Diseña un dashboard interactivo.

INDUSTRIA: ${project?.industry || 'general'}
KPIs RELEVANTES: ${kpis.join(', ')}

DATOS DISPONIBLES:
${executions?.map(ex => `
Endpoint: ${ex.endpoint}
Datos: ${JSON.stringify(ex.response_data).substring(0, 300)}
`).join('\n---\n')}

INSIGHTS DISPONIBLES:
${insights?.map(ins => `- ${ins.title}: ${ins.description}`).join('\n')}

TAREA: Diseña un dashboard con widgets específicos en formato JSON:
{
  "name": "Nombre del Dashboard",
  "description": "Descripción breve",
  "layout": {
    "rows": 3,
    "columns": 4
  },
  "widgets": [
    {
      "id": "widget1",
      "type": "metric|chart|table|list|gauge",
      "title": "Título del widget",
      "position": {"row": 0, "col": 0, "width": 2, "height": 1},
      "config": {
        "metric": "nombre_metrica",
        "value": "valor",
        "trend": "up|down|stable",
        "trendValue": "+10%",
        "color": "green|red|blue|yellow"
      },
      "chartConfig": {
        "type": "line|bar|pie|area",
        "data": [],
        "xAxis": "campo_x",
        "yAxis": "campo_y"
      },
      "dataSource": {
        "type": "execution|insight|calculated",
        "endpoint": "ruta_del_endpoint",
        "field": "campo_a_mostrar"
      }
    }
  ],
  "filters": [
    {
      "name": "Filtro de fecha",
      "type": "daterange|select|multiselect",
      "options": []
    }
  ],
  "refreshInterval": 300
}

Incluye:
1. Métricas clave (KPIs)
2. Gráficos de tendencias
3. Tablas de datos importantes
4. Alertas o indicadores críticos
5. Comparaciones temporales

Diseña para que sea intuitivo y visualmente atractivo.`;

        const { response, model } = await executeAI(
            prompt,
            userId,
            TASK_TYPES.DASHBOARD_GENERATION,
            projectId
        );

        // Parsear respuesta
        let dashboardConfig;
        try {
            let clean = response.trim();
            if (clean.startsWith('```json')) {
                clean = clean.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            dashboardConfig = JSON.parse(clean);
        } catch (e) {
            log.error('Error al parsear dashboard', e, {
                module: 'dashboard-agent',
                userId,
                projectId
            });
            throw new Error('No se pudo generar un dashboard válido');
        }

        // Guardar dashboard en BD
        const { data: dashboard } = await supabase
            .from('dashboards')
            .insert({
                project_id: projectId,
                name: dashboardConfig.name,
                description: dashboardConfig.description,
                layout: dashboardConfig,
                data_sources: {
                    executions: executions?.map(ex => ex.id) || [],
                    insights: insights?.map(ins => ins.id) || []
                },
                ai_model: model
            })
            .select()
            .single();

        log.info('Dashboard generado y guardado', {
            module: 'dashboard-agent',
            userId,
            projectId,
            dashboardId: dashboard.id,
            widgetsCount: dashboardConfig.widgets.length,
            model
        });

        return dashboard;
    } catch (error) {
        log.error('Error al generar dashboard', error, {
            module: 'dashboard-agent',
            userId,
            projectId
        });
        throw error;
    }
}

/**
 * Actualizar datos del dashboard
 */
export async function refreshDashboardData(dashboardId) {
    try {
        const { data: dashboard } = await supabase
            .from('dashboards')
            .select('*, projects!inner(id)')
            .eq('id', dashboardId)
            .single();

        if (!dashboard) {
            throw new Error('Dashboard no encontrado');
        }

        // Obtener datos actualizados
        const { data: executions } = await supabase
            .from('executions')
            .select('*')
            .in('id', dashboard.data_sources.executions || []);

        const { data: insights } = await supabase
            .from('insights')
            .select('*')
            .in('id', dashboard.data_sources.insights || []);

        return {
            dashboard,
            data: {
                executions,
                insights
            }
        };
    } catch (error) {
        log.error('Error al actualizar datos del dashboard', error, {
            module: 'dashboard-agent',
            dashboardId
        });
        throw error;
    }
}
