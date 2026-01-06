# 🚀 Guía de Inicio Rápido - DataLIVE

Esta guía te ayudará a tener DataLIVE funcionando en **menos de 10 minutos**.

---

## ⚡ Instalación Rápida

### 1. Clonar Repositorio

```bash
git clone https://github.com/tu-usuario/Datalive_IA.git
cd Datalive_IA
```

### 2. Configurar Supabase

1. Ir a [supabase.com](https://supabase.com) y crear un proyecto
2. En SQL Editor, ejecutar:
   - `supabase/schema.sql`
   - `supabase/schema_additional.sql`
3. En Storage, crear bucket `documents` (público)
4. Copiar:
   - URL del proyecto
   - `anon` key
   - `service_role` key

### 3. Obtener API Keys de IA

**Mínimo requerido** (una de estas):
- [Google AI Studio](https://makersuite.google.com/app/apikey) - Gemini (GRATIS)
- [Anthropic Console](https://console.anthropic.com/) - Claude
- [OpenAI Platform](https://platform.openai.com/api-keys) - GPT

**Opcionales**:
- Qwen - [Alibaba Cloud](https://dashscope.console.aliyun.com/)
- DeepSeek - [DeepSeek Platform](https://platform.deepseek.com/)

### 4. Configurar Variables de Entorno

```bash
# Copiar ejemplo
cp .env.example .env

# Editar .env
nano .env  # o usa tu editor favorito
```

**Configuración mínima**:
```env
# Supabase (REQUERIDO)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_KEY=tu-service-key

# IA (AL MENOS UNA)
GOOGLE_API_KEY=tu-gemini-key

# JWT (REQUERIDO)
JWT_SECRET=cualquier-string-aleatorio-largo-y-seguro

# URLs (REQUERIDO)
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend (en otra terminal)
cd ../frontend
npm install
```

### 6. Iniciar Aplicación

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 7. Crear Usuario Administrador

En Supabase SQL Editor:

```sql
-- Crear usuario admin
INSERT INTO users (email, password, role, name)
VALUES (
  'admin@datalive.com',
  '$2b$10$YourHashedPasswordHere',  -- Ver nota abajo
  'admin',
  'Administrador'
);
```

**Generar hash de contraseña**:
```bash
node -e "console.log(require('bcrypt').hashSync('tu-contraseña', 10))"
```

### 8. Acceder a la Aplicación

Abrir [http://localhost:3000](http://localhost:3000)

- Email: `admin@datalive.com`
- Contraseña: la que configuraste

---

## 🎯 Primer Uso

### Paso 1: Crear Proyecto

1. Click en "Nuevo Proyecto"
2. Nombre: `Mi Primer Proyecto`
3. Industria: Selecciona la que corresponda
4. Descripción: Breve descripción

### Paso 2: Subir Documentación

**Opción A: PDF**
1. Click en "Subir Documento"
2. Selecciona un PDF de documentación de API
3. Espera el análisis (puede tomar 1-2 minutos)

**Opción B: URL**
1. Click en "Desde URL"
2. Pega la URL de la documentación
3. Espera el scraping y análisis

### Paso 3: Ver APIs Descubiertas

1. Ve a "APIs Descubiertas"
2. Verás todas las APIs encontradas automáticamente
3. Cada API muestra:
   - Nombre y descripción
   - Endpoints disponibles
   - Métodos de autenticación

### Paso 4: Configurar Credenciales

1. El sistema te pedirá las credenciales necesarias
2. Ingresa las credenciales **UNA SOLA VEZ**
3. Se guardan automáticamente

### Paso 5: Ejecutar APIs

1. Click en "Ejecutar Todas las APIs"
2. El sistema ejecuta todos los endpoints automáticamente
3. Verás explicaciones en lenguaje simple

### Paso 6: Ver Insights

1. Ve a "Insights"
2. Verás análisis automáticos:
   - Tendencias
   - Patrones
   - Recomendaciones
   - Alertas

### Paso 7: Ver Dashboard

1. Ve a "Dashboard"
2. Dashboard generado automáticamente con:
   - KPIs relevantes
   - Gráficos interactivos
   - Filtros

### Paso 8: Chat con tu Proyecto

1. Ve a "Chat"
2. Pregunta cualquier cosa sobre tu proyecto:
   - "¿Cuántos usuarios activos tenemos?"
   - "¿Cuál es la tendencia de ventas?"
   - "¿Qué APIs están fallando?"

---

## 🔧 Configuración de Agentes

### Ver Configuración Actual

```bash
GET /api/agents/config
```

### Editar Agente

Ejemplo: Aumentar límite de páginas PDF

```bash
PUT /api/agents/config/document-reader
{
  "config": {
    "maxPages": 2000,
    "chunkSize": 100000,
    "enableScraping": true
  }
}
```

---

## 🤖 Seleccionar Modelo de IA

### Ver Modelos Disponibles

```bash
GET /api/models
```

### Cambiar Modelo por Defecto

1. Ve a "Configuración"
2. Sección "Modelos de IA"
3. Selecciona tu modelo preferido
4. Guarda cambios

**Modelos recomendados**:
- **Gemini 2.5 Flash** - Rápido y económico (por defecto)
- **Claude 3.5 Sonnet** - Equilibrado
- **GPT-4o** - Más potente
- **Qwen Max** - Alternativa económica
- **DeepSeek** - Ultra económico

---

## 📊 Casos de Uso Rápidos

### Caso 1: Analizar API de Pagos

```
1. Subir documentación de Stripe/PayPal
2. Sistema descubre endpoints automáticamente
3. Configurar API keys
4. Ejecutar endpoints
5. Ver insights de transacciones
```

### Caso 2: Monitorear Telecomunicaciones

```
1. Subir docs de API de red
2. Sistema detecta métricas de calidad
3. Ejecutar endpoints de monitoreo
4. Dashboard con KPIs de red
5. Alertas de degradación
```

### Caso 3: Análisis de eCommerce

```
1. Subir API de tienda online
2. Descubrir endpoints de productos/pedidos
3. Ejecutar análisis de ventas
4. Insights de conversión y abandono
5. Recomendaciones de optimización
```

---

## 🐛 Solución de Problemas

### Error: "No se puede conectar al backend"

```bash
# Verificar que el backend esté corriendo
cd backend
npm run dev

# Verificar puerto
# Debe estar en http://localhost:3001
```

### Error: "Supabase connection failed"

```bash
# Verificar variables de entorno
cat .env | grep SUPABASE

# Verificar que las keys sean correctas
# Ir a Supabase > Settings > API
```

### Error: "AI model not available"

```bash
# Verificar API key
cat .env | grep API_KEY

# Probar la key
curl https://generativelanguage.googleapis.com/v1/models?key=TU_API_KEY
```

### PDFs no se procesan

```bash
# Verificar bucket en Supabase Storage
# Debe existir: documents (público)

# Verificar permisos
# Storage > documents > Policies
```

---

## 📚 Recursos Adicionales

- **[README.md](README.md)** - Documentación completa
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía de despliegue
- **[MODEL_MASTER.md](MODEL_MASTER.md)** - Sistema de modelos IA
- **[AGENTS_SYSTEM.md](AGENTS_SYSTEM.md)** - Agentes especializados
- **[EXECUTION_SYSTEM.md](EXECUTION_SYSTEM.md)** - Ejecución de APIs

---

## 💡 Tips

1. **Usa Gemini 2.5 Flash** - Es gratis y muy bueno
2. **PDFs grandes** - El sistema puede con 1500+ páginas
3. **Credenciales** - Solo las pides UNA VEZ
4. **Chat** - Úsalo para entender tus datos
5. **Configuración** - Ajusta los agentes según tus necesidades

---

## 🎉 ¡Listo!

Ya tienes DataLIVE funcionando. Ahora puedes:

✅ Subir cualquier documentación de API  
✅ Descubrir endpoints automáticamente  
✅ Ejecutar APIs sin código  
✅ Generar insights de negocio  
✅ Crear dashboards interactivos  
✅ Conversar con tus datos  

**¿Problemas?** Abre un issue en GitHub

**¿Preguntas?** Revisa la documentación completa

---

**DataLIVE** - De documentación técnica a insights de negocio en minutos
