/**
 * Sistema de Expertos por Industria
 * Proporciona contexto especializado para cada tipo de negocio
 */

const experts = {
    fintech: {
        name: 'Fintech Expert',
        getContext: () => `
Experto en servicios financieros y tecnología financiera.
KPIs relevantes: Transacciones por segundo, tasa de conversión, valor promedio de transacción, tasa de fraude, tiempo de procesamiento.
Métricas importantes: Volumen de transacciones, usuarios activos, saldo promedio, tasa de retención.
Enfoque: Seguridad, cumplimiento regulatorio, experiencia de usuario en pagos.
`,
        getKPIs: () => ['transaction_volume', 'conversion_rate', 'fraud_rate', 'processing_time', 'user_retention'],
        getRecommendations: (data) => [
            'Monitorear tasas de fraude en tiempo real',
            'Optimizar flujos de pago para reducir abandono',
            'Implementar autenticación de dos factores',
            'Analizar patrones de transacciones sospechosas'
        ]
    },

    telco: {
        name: 'Telecom Expert',
        getContext: () => `
Experto en telecomunicaciones y servicios móviles.
KPIs relevantes: ARPU (Average Revenue Per User), tasa de churn, calidad de servicio (QoS), tiempo de activación.
Métricas importantes: Cobertura de red, velocidad promedio, latencia, disponibilidad.
Enfoque: Calidad de servicio, retención de clientes, optimización de red.
`,
        getKPIs: () => ['arpu', 'churn_rate', 'network_quality', 'activation_time', 'customer_satisfaction'],
        getRecommendations: (data) => [
            'Monitorear calidad de servicio por zona geográfica',
            'Identificar clientes en riesgo de churn',
            'Optimizar capacidad de red en horas pico',
            'Analizar patrones de uso para ofertas personalizadas'
        ]
    },

    mining: {
        name: 'Mining Expert',
        getContext: () => `
Experto en minería y extracción de recursos naturales.
KPIs relevantes: Producción diaria, eficiencia operacional, costos por tonelada, tiempo de inactividad.
Métricas importantes: Toneladas procesadas, ley del mineral, recuperación, consumo energético.
Enfoque: Eficiencia operacional, seguridad, sostenibilidad ambiental.
`,
        getKPIs: () => ['daily_production', 'operational_efficiency', 'cost_per_ton', 'downtime', 'recovery_rate'],
        getRecommendations: (data) => [
            'Optimizar procesos para reducir tiempo de inactividad',
            'Monitorear consumo energético por proceso',
            'Analizar eficiencia de equipos críticos',
            'Implementar mantenimiento predictivo'
        ]
    },

    banking: {
        name: 'Banking Expert',
        getContext: () => `
Experto en banca y servicios financieros tradicionales.
KPIs relevantes: ROA (Return on Assets), índice de morosidad, margen de interés neto, eficiencia operativa.
Métricas importantes: Cartera de créditos, depósitos, liquidez, capital regulatorio.
Enfoque: Gestión de riesgo, cumplimiento regulatorio, rentabilidad.
`,
        getKPIs: () => ['roa', 'npl_ratio', 'net_interest_margin', 'efficiency_ratio', 'capital_adequacy'],
        getRecommendations: (data) => [
            'Monitorear índice de morosidad por segmento',
            'Optimizar gestión de liquidez',
            'Analizar rentabilidad por producto',
            'Implementar modelos de scoring crediticio'
        ]
    },

    ecommerce: {
        name: 'eCommerce Expert',
        getContext: () => `
Experto en comercio electrónico y retail digital.
KPIs relevantes: Tasa de conversión, valor promedio del pedido (AOV), tasa de abandono de carrito, CAC (Customer Acquisition Cost).
Métricas importantes: Tráfico web, sesiones, tiempo en sitio, productos más vendidos.
Enfoque: Experiencia de usuario, optimización de conversión, logística.
`,
        getKPIs: () => ['conversion_rate', 'aov', 'cart_abandonment', 'cac', 'ltv'],
        getRecommendations: (data) => [
            'Optimizar checkout para reducir abandono',
            'Analizar productos con mayor margen',
            'Implementar recomendaciones personalizadas',
            'Monitorear tiempos de entrega'
        ]
    },

    meta: {
        name: 'Meta/WhatsApp Expert',
        getContext: () => `
Experto en plataformas Meta (Facebook, Instagram, WhatsApp).
KPIs relevantes: Engagement rate, alcance, impresiones, tasa de respuesta, tiempo de respuesta.
Métricas importantes: Mensajes enviados/recibidos, usuarios activos, tasa de conversión de campañas.
Enfoque: Engagement, automatización, atención al cliente.
`,
        getKPIs: () => ['engagement_rate', 'reach', 'response_rate', 'response_time', 'conversion_rate'],
        getRecommendations: (data) => [
            'Automatizar respuestas frecuentes',
            'Analizar horarios de mayor actividad',
            'Segmentar audiencias para campañas',
            'Monitorear satisfacción del cliente'
        ]
    },

    'public-market': {
        name: 'Public Market Expert',
        getContext: () => `
Experto en mercado público y licitaciones gubernamentales.
KPIs relevantes: Tasa de adjudicación, tiempo de respuesta a licitaciones, monto promedio adjudicado.
Métricas importantes: Licitaciones activas, propuestas enviadas, contratos vigentes.
Enfoque: Cumplimiento normativo, competitividad, gestión de contratos.
`,
        getKPIs: () => ['award_rate', 'response_time', 'average_contract_value', 'active_contracts', 'compliance_rate'],
        getRecommendations: (data) => [
            'Monitorear nuevas licitaciones en tiempo real',
            'Analizar tasas de éxito por tipo de licitación',
            'Optimizar tiempos de preparación de propuestas',
            'Gestionar vencimientos de contratos'
        ]
    },

    general: {
        name: 'General Expert',
        getContext: () => `
Experto generalista en análisis de APIs y datos.
KPIs relevantes: Disponibilidad, tiempo de respuesta, tasa de error, volumen de requests.
Métricas importantes: Usuarios activos, sesiones, eventos, conversiones.
Enfoque: Rendimiento, confiabilidad, experiencia de usuario.
`,
        getKPIs: () => ['uptime', 'response_time', 'error_rate', 'request_volume', 'user_satisfaction'],
        getRecommendations: (data) => [
            'Monitorear disponibilidad de servicios',
            'Optimizar tiempos de respuesta',
            'Analizar patrones de uso',
            'Implementar alertas proactivas'
        ]
    }
};

/**
 * Obtener experto por industria
 */
export function getIndustryExpert(industry) {
    return experts[industry] || experts.general;
}

/**
 * Listar todas las industrias disponibles
 */
export function getAvailableIndustries() {
    return Object.keys(experts).filter(key => key !== 'general');
}
