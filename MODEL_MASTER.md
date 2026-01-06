# Módulo Master de Modelos IA - DataLIVE

## 🎯 Objetivo

Crear un sistema **extensible y flexible** para gestionar múltiples proveedores de IA sin necesidad de cambios estructurales cuando se agregan nuevos modelos.

---

## ✅ Características

### 1. **Diseño Extensible**
- Agregar nuevos modelos editando solo el catálogo
- Sin cambios en el código de ejecución
- Soporte para múltiples proveedores

### 2. **Proveedores Soportados**
- ✅ Google (Gemini)
- ✅ Anthropic (Claude)
- ✅ OpenAI (GPT)
- ✅ Qwen (Alibaba Cloud)
- ✅ DeepSeek

### 3. **Modelo por Defecto**
- `gemini-2.5-flash` configurado como predeterminado
- Cambio fácil desde configuración

---

## 📋 Catálogo de Modelos

### Google Gemini

```javascript
'gemini-2.5-flash': {
  provider: 'google',
  name: 'Gemini 2.5 Flash',
  description: 'Última versión de Gemini Flash (por defecto)',
  maxTokens: 8192,
  enabled: true,
  isDefault: true  // ← Modelo por defecto
}
```

### Anthropic Claude

```javascript
'claude-3-5-sonnet-20241022': {
  provider: 'anthropic',
  name: 'Claude 3.5 Sonnet',
  maxTokens: 8192,
  enabled: true
}

'claude-3-5-opus-20250115': {
  provider: 'anthropic',
  name: 'Claude 3.5 Opus',
  maxTokens: 8192,
  enabled: true
}

'claude-3-5-haiku-20241022': {
  provider: 'anthropic',
  name: 'Claude 3.5 Haiku',
  maxTokens: 8192,
  enabled: true
}
```

### OpenAI

```javascript
'gpt-4o': {
  provider: 'openai',
  name: 'GPT-4o',
  maxTokens: 128000,
  enabled: true
}

'gpt-4-turbo': {
  provider: 'openai',
  name: 'GPT-4 Turbo',
  maxTokens: 128000,
  enabled: true
}
```

### Qwen

```javascript
'qwen-max': {
  provider: 'qwen',
  name: 'Qwen Max',
  maxTokens: 8192,
  enabled: false,  // Requiere API key
  requiresApiKey: 'QWEN_API_KEY'
}
```

### DeepSeek

```javascript
'deepseek-chat': {
  provider: 'deepseek',
  name: 'DeepSeek Chat',
  maxTokens: 8192,
  enabled: false,  // Requiere API key
  requiresApiKey: 'DEEPSEEK_API_KEY'
}
```

---

## 🔧 Cómo Agregar un Nuevo Modelo

### Paso 1: Agregar al Catálogo

Edita `backend/src/services/model-master.service.js`:

```javascript
export const MODEL_CATALOG = {
  // ... modelos existentes ...
  
  // NUEVO MODELO
  'nuevo-modelo-id': {
    provider: 'proveedor',  // google, anthropic, openai, qwen, deepseek
    name: 'Nombre del Modelo',
    description: 'Descripción breve',
    maxTokens: 8192,
    supportsStreaming: true,
    costPer1kTokens: 0.001,
    enabled: true
  }
};
```

### Paso 2: Listo!

No se necesitan más cambios. El sistema automáticamente:
- ✅ Lo detecta en el catálogo
- ✅ Lo muestra en la lista de modelos
- ✅ Permite seleccionarlo
- ✅ Lo ejecuta correctamente

---

## 🔌 Configuración de API Keys

### Variables de Entorno

```bash
# Google Gemini
GOOGLE_API_KEY=tu-api-key-aqui

# Anthropic Claude
ANTHROPIC_API_KEY=tu-api-key-aqui

# OpenAI
OPENAI_API_KEY=tu-api-key-aqui

# Qwen (Alibaba Cloud)
QWEN_API_KEY=tu-api-key-aqui

# DeepSeek
DEEPSEEK_API_KEY=tu-api-key-aqui
```

### Habilitar Modelos

Los modelos se habilitan automáticamente si su API key está configurada:

```javascript
// En model-master.service.js
function initializeClients() {
  // Si existe la API key, el cliente se inicializa
  if (process.env.QWEN_API_KEY) {
    clients[PROVIDERS.QWEN] = new OpenAI({
      apiKey: process.env.QWEN_API_KEY,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    });
  }
}
```

---

## 💬 Chat Conversacional

### Características

✅ **Conversa con toda la información del proyecto**
- APIs descubiertas
- Ejecuciones realizadas
- Insights generados
- Documentos cargados

✅ **Contexto completo**
- El chat tiene acceso a toda la información
- Respuestas basadas en datos reales
- Sugerencias personalizadas

✅ **Historial persistente**
- Se guarda en base de datos
- Recuperable en cualquier momento

### Ejemplo de Uso

```javascript
// POST /api/chat/:projectId
{
  "message": "¿Cuántos usuarios activos tenemos?",
  "history": [
    { "role": "user", "content": "Hola" },
    { "role": "assistant", "content": "Hola, ¿en qué puedo ayudarte?" }
  ]
}

// Respuesta
{
  "response": "Según la última ejecución de la API /users, tienes 1,250 usuarios activos, lo que representa un incremento del 25% respecto al mes anterior.",
  "modelUsed": "gemini-2.5-flash",
  "executionTime": 1234,
  "context": {
    "apisCount": 5,
    "executionsCount": 23,
    "insightsCount": 8
  }
}
```

---

## ⚙️ Panel de Configuración de Agentes

### Ver Configuración

```javascript
// GET /api/agents/config
[
  {
    "agent_name": "document-reader",
    "config": {
      "maxPages": 1500,
      "chunkSize": 50000,
      "enableScraping": true
    },
    "is_active": true
  },
  {
    "agent_name": "api-executor",
    "config": {
      "timeout": 30000,
      "retries": 3,
      "autoInferParams": true
    },
    "is_active": true
  }
]
```

### Editar Configuración

```javascript
// PUT /api/agents/config/document-reader
{
  "config": {
    "maxPages": 2000,  // Aumentar límite
    "chunkSize": 100000,
    "enableScraping": true,
    "scrapingDepth": 5
  }
}
```

### Configuraciones Disponibles

#### Agente: document-reader
```javascript
{
  "maxPages": 1500,           // Máximo de páginas PDF
  "chunkSize": 50000,          // Tamaño de chunks
  "enableScraping": true,      // Habilitar scraping web
  "scrapingDepth": 5,          // Profundidad de scraping
  "detectFormats": true        // Detectar formatos de API
}
```

#### Agente: api-executor
```javascript
{
  "timeout": 30000,            // Timeout en ms
  "retries": 3,                // Reintentos
  "autoInferParams": true,     // Inferir parámetros con IA
  "saveHistory": true          // Guardar historial
}
```

#### Agente: insight-generator
```javascript
{
  "minExecutions": 5,          // Mínimo de ejecuciones
  "categories": [              // Categorías de insights
    "trend", "pattern", "recommendation", "alert"
  ],
  "autoGenerate": true         // Generar automáticamente
}
```

---

## 🎨 Frontend - Selector de Modelos

### Componente de Selección

```jsx
// frontend/src/components/ModelSelector.js
'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export default function ModelSelector({ taskType, onSelect }) {
  const [models, setModels] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    const { data } = await api.get('/api/models')
    setModels(data.models)
    setSelected(data.default)
  }

  const handleSelect = (modelId) => {
    setSelected(modelId)
    onSelect(modelId)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Seleccionar Modelo IA</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map(model => (
          <div
            key={model.id}
            onClick={() => handleSelect(model.id)}
            className={`p-4 rounded-lg cursor-pointer transition-all ${
              selected === model.id
                ? 'bg-primary-500 text-white'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{model.name}</h4>
                <p className="text-sm opacity-75">{model.description}</p>
              </div>
              {model.isDefault && (
                <span className="text-xs bg-green-500 px-2 py-1 rounded">
                  Por defecto
                </span>
              )}
            </div>
            <div className="mt-2 text-xs opacity-60">
              Max tokens: {model.maxTokens.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 📡 API Endpoints

### Modelos

```
GET  /api/models           - Listar modelos disponibles
GET  /api/models/catalog   - Catálogo completo
```

### Chat

```
POST /api/chat/:projectId           - Enviar mensaje
GET  /api/chat/:projectId/history   - Obtener historial
```

### Configuración de Agentes

```
GET  /api/agents/config              - Ver configuración
PUT  /api/agents/config/:agentName   - Actualizar configuración
```

---

## 🚀 Ventajas del Sistema

### 1. Extensibilidad
- ✅ Agregar nuevos modelos sin cambiar código
- ✅ Solo editar el catálogo
- ✅ Sin recompilación necesaria

### 2. Flexibilidad
- ✅ Cambiar modelo por defecto fácilmente
- ✅ Habilitar/deshabilitar modelos
- ✅ Configurar por tarea

### 3. Mantenibilidad
- ✅ Código limpio y organizado
- ✅ Un solo punto de configuración
- ✅ Fácil de entender

### 4. Escalabilidad
- ✅ Soporta múltiples proveedores
- ✅ Preparado para futuros modelos
- ✅ Sin límite de modelos

---

## 📝 Ejemplo Completo

### 1. Usuario selecciona modelo

```jsx
<ModelSelector 
  taskType="chat"
  onSelect={(modelId) => setSelectedModel(modelId)}
/>
```

### 2. Sistema usa el modelo seleccionado

```javascript
// Backend automáticamente usa el modelo
const result = await chatWithProject(projectId, message, userId);
// Usa el modelo preferido del usuario o el default
```

### 3. Usuario ve configuración de agentes

```jsx
<AgentConfig agentName="document-reader" />
```

### 4. Usuario edita configuración

```javascript
await api.put('/api/agents/config/document-reader', {
  config: {
    maxPages: 2000,
    enableScraping: true
  }
});
```

---

## ✅ Garantías

1. ✅ **Sin cambios estructurales** al agregar modelos
2. ✅ **Gemini 2.5 Flash** por defecto
3. ✅ **Todos los modelos** seleccionables
4. ✅ **Chat conversacional** con información completa
5. ✅ **Configuración de agentes** editable
6. ✅ **Sistema extensible** y mantenible
