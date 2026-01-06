# DataLIVE

**Plataforma de Inteligencia de APIs con IA Multi-Agente**

Descubre, ejecuta y genera insights de negocio a partir de documentación técnica de APIs mediante un sistema de agentes especializados de IA.

![DataLIVE Architecture](https://img.shields.io/badge/Stack-Next.js%20%7C%20Node.js%20%7C%20Supabase-blue)
![AI Models](https://img.shields.io/badge/IA-Gemini%20%7C%20Claude%20%7C%20GPT-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🚀 Características Principales

### 🤖 Sistema de 6 Agentes Especializados

1. **Experto en Documentación** - Lee PDFs de 1500+ páginas y scrapea sitios web completos
2. **Lector de APIs** - Descubre automáticamente endpoints, parámetros y credenciales
3. **Comunicador con Usuario** - Explica todo en lenguaje simple, sin términos técnicos
4. **Ejecutor de APIs** - Ejecuta endpoints automáticamente con credenciales guardadas
5. **Generador de Insights** - Analiza datos y genera recomendaciones de negocio
6. **Generador de Dashboards** - Crea visualizaciones interactivas automáticamente

### 💡 Módulo Master de Modelos IA

- **Diseño extensible** - Agrega nuevos modelos sin cambios estructurales
- **Múltiples proveedores** - Gemini, Claude, OpenAI, Qwen, DeepSeek
- **Selección flexible** - Elige el modelo para cada tarea
- **Por defecto**: Gemini 2.5 Flash

### 💬 Chat Conversacional

- Conversa con toda la información del proyecto
- Contexto completo de APIs, ejecuciones e insights
- Historial persistente

### ⚙️ Panel de Configuración

- Ver y editar configuración de cada agente
- Ajustar parámetros (límites, timeouts, etc.)
- Activar/desactivar funcionalidades

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15** - Framework React con App Router
- **React 19** - Biblioteca UI
- **Tailwind CSS 3** - Estilos con tema dark y glassmorphism
- **Zustand** - Estado global
- **Socket.IO Client** - WebSockets para logs en tiempo real
- **Recharts** - Visualizaciones de datos

### Backend
- **Node.js 20+** - Runtime
- **Express 4** - Framework web
- **Socket.IO** - WebSockets
- **Winston** - Sistema de logging avanzado
- **Multer** - Carga de archivos
- **PDF-Parse** - Procesamiento de PDFs
- **Cheerio** - Web scraping

### Base de Datos
- **Supabase** - PostgreSQL con Row Level Security
- **Storage** - Almacenamiento de archivos

### Inteligencia Artificial
- **Google Gemini 2.5 Flash** - Modelo por defecto
- **Anthropic Claude** - Sonnet 3.5, Opus 3.5, Haiku 3.5
- **OpenAI GPT** - 4o, 4 Turbo, 3.5 Turbo
- **Qwen** - Max, Plus
- **DeepSeek** - Chat

### Infraestructura
- **Vercel** - Hosting del frontend
- **Render** - Hosting del backend
- **Supabase Cloud** - Base de datos y storage

---

## 📦 Instalación

### Prerrequisitos

- Node.js 20+
- npm o yarn
- Cuenta en Supabase
- API Keys de IA (Gemini, Claude, etc.)

### 1. Clonar Repositorio

```bash
git clone https://github.com/tu-usuario/Datalive_IA.git
cd Datalive_IA
```

### 2. Configurar Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar `supabase/schema.sql` en SQL Editor
3. Ejecutar `supabase/schema_additional.sql` en SQL Editor
4. Crear bucket `documents` en Storage
5. Copiar URL y API keys

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
```

**Variables requeridas**:
```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_KEY=tu-service-key

# IA (al menos una)
GOOGLE_API_KEY=tu-gemini-api-key
ANTHROPIC_API_KEY=tu-claude-api-key
OPENAI_API_KEY=tu-openai-api-key
QWEN_API_KEY=tu-qwen-api-key
DEEPSEEK_API_KEY=tu-deepseek-api-key

# JWT
JWT_SECRET=tu-secret-aleatorio-seguro

# URLs
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Iniciar Desarrollo

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## 🚀 Despliegue en Producción

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para instrucciones detalladas.

**Resumen**:
1. Configurar Supabase en producción
2. Desplegar backend en Render
3. Desplegar frontend en Vercel
4. Configurar variables de entorno
5. Crear usuario administrador

---

## 📖 Documentación

- **[AGENTS_SYSTEM.md](AGENTS_SYSTEM.md)** - Sistema de agentes especializados
- **[EXECUTION_SYSTEM.md](EXECUTION_SYSTEM.md)** - Ejecución automática de APIs
- **[MODEL_MASTER.md](MODEL_MASTER.md)** - Módulo master de modelos IA
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía de despliegue
- **[walkthrough.md](.gemini/antigravity/brain/.../walkthrough.md)** - Implementación completa

---

## 🎯 Casos de Uso

### 1. Fintech
- Analiza APIs de pagos, transacciones y cuentas
- Genera insights sobre volumen de transacciones y fraude
- Dashboards con KPIs financieros

### 2. Telecomunicaciones
- Integra APIs de red, usuarios y servicios
- Monitorea calidad de servicio y churn
- Reportes de ARPU y cobertura

### 3. eCommerce
- Conecta APIs de productos, pedidos y clientes
- Analiza conversión y abandono de carrito
- Insights de ventas y recomendaciones

### 4. Mercado Público
- Procesa APIs de licitaciones y contratos
- Monitorea nuevas oportunidades
- Reportes de adjudicaciones

### 5. Cualquier Industria
- Sistema adaptable a cualquier tipo de API
- Expertos configurables por industria
- KPIs personalizables

---

## 💡 Flujo de Uso

### Paso 1: Crear Proyecto
```
Usuario → Crear proyecto → Seleccionar industria
```

### Paso 2: Subir Documentación
```
Usuario → Subir PDF (1500+ páginas) o URL
       → Agente 1 procesa documento
       → Agente 2 descubre APIs y endpoints
```

### Paso 3: Configurar Credenciales
```
Agente 3 → Explica qué credenciales se necesitan
Usuario → Proporciona credenciales UNA VEZ
       → Sistema las guarda (nunca las vuelve a pedir)
```

### Paso 4: Ejecutar APIs
```
Usuario → Click "Ejecutar Todas las APIs"
Agente 4 → Ejecuta todos los endpoints automáticamente
        → Genera explicaciones en lenguaje simple
```

### Paso 5: Ver Resultados
```
Agente 5 → Genera insights de negocio
Agente 6 → Crea dashboards interactivos
Usuario → Conversa con el chat para profundizar
```

---

## � Seguridad

- **Autenticación JWT** - Tokens seguros
- **Row Level Security** - Aislamiento de datos por usuario
- **Credenciales encriptadas** - (TODO: implementar en producción)
- **CORS configurado** - Solo orígenes permitidos
- **Rate limiting** - Protección contra abuso
- **Validación de entrada** - Sanitización de datos

---

## 📊 Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Vercel)                     │
│  Next.js 15 + React 19 + Tailwind CSS + Socket.IO      │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS/WSS
┌────────────────────▼────────────────────────────────────┐
│                   Backend (Render)                       │
│  Express + Winston Logger + Socket.IO + AI Orchestrator │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Sistema de 6 Agentes Especializados      │  │
│  │  1. Document Expert  2. API Reader               │  │
│  │  3. User Communicator 4. API Executor            │  │
│  │  5. Insight Generator 6. Dashboard Generator     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Módulo Master de Modelos IA            │  │
│  │  Gemini | Claude | OpenAI | Qwen | DeepSeek     │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Supabase (PostgreSQL + Storage)             │
│  RLS + 11 Tablas + File Storage + Real-time             │
└─────────────────────────────────────────────────────────┘
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📝 Roadmap

### ✅ Completado
- [x] Sistema de 6 agentes especializados
- [x] Módulo master de modelos IA
- [x] Chat conversacional
- [x] Panel de configuración de agentes
- [x] Ejecución automática de APIs
- [x] Sistema de logging completo
- [x] Soporte para PDFs grandes (1500+ páginas)
- [x] Web scraping automático
- [x] Detección de múltiples formatos de API
- [x] Generación de insights
- [x] Generación de dashboards

### � En Desarrollo
- [ ] Frontend completo (páginas de gestión)
- [ ] Componentes de visualización
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Notificaciones push
- [ ] Encriptación de credenciales

### 🔮 Futuro
- [ ] Integración con más proveedores de IA
- [ ] Marketplace de expertos por industria
- [ ] Plantillas de dashboards
- [ ] Automatización de workflows
- [ ] API pública de DataLIVE

---

## �📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles

---

## 👥 Equipo

Desarrollado con ❤️ por el equipo de DataLIVE

---

## 📧 Contacto

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/Datalive_IA/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tu-usuario/Datalive_IA/discussions)

---

## 🙏 Agradecimientos

- Google Gemini
- Anthropic Claude
- OpenAI
- Supabase
- Vercel
- Render
- Comunidad Open Source

---

**DataLIVE** - Transforma documentación técnica en insights de negocio con IA
