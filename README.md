# DataLIVE

Plataforma de inteligencia de APIs que permite descubrir, ejecutar y generar insights de negocio mediante múltiples IAs especializadas.

## 🚀 Características

- **Gestión de Proyectos**: Organiza tus APIs por proyectos
- **Análisis Inteligente**: Carga documentación y descubre APIs automáticamente
- **Múltiples Modelos IA**: Gemini 2.5 Flash, Claude Sonnet 3.5, Opus 3.5, Haiku 3.5
- **6 IAs Especializadas**:
  - Lector de documentación
  - Detector de autenticación
  - Ejecutor de APIs
  - Generador de reportes
  - Generador de insights
  - Generador de dashboards
- **Expertos por Industria**: Fintech, Telco, Minería, Banca, eCommerce, etc.
- **Sistema de Logging**: Logs detallados en tiempo real
- **Multi-usuario**: Aislamiento completo de datos por usuario

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 + React + Tailwind CSS (Vercel)
- **Backend**: Node.js + Express (Render)
- **Base de Datos**: Supabase (PostgreSQL)
- **IA**: Google Gemini 2.5 Flash + Anthropic Claude

## 📦 Instalación

### 1. Configurar Supabase

```bash
# Ejecutar el script SQL en Supabase
# Ver: supabase/schema.sql
```

### 2. Backend

```bash
cd backend
npm install
cp ../.env.example .env
# Configurar variables de entorno en .env
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local
# Configurar variables de entorno en .env.local
npm run dev
```

## 🌐 Despliegue

### Supabase
1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar `supabase/schema.sql`
3. Copiar URL y keys

### Render (Backend)
1. Conectar repositorio
2. Configurar variables de entorno
3. Deploy automático

### Vercel (Frontend)
1. Conectar repositorio
2. Configurar variables de entorno
3. Deploy automático

## 📝 Uso

1. **Login**: Accede con tus credenciales
2. **Crear Proyecto**: Crea un nuevo proyecto
3. **Subir Documentación**: Carga PDFs o URLs de documentación de APIs
4. **Análisis Automático**: La IA descubre endpoints y credenciales
5. **Ejecutar APIs**: Ejecuta las APIs descubiertas
6. **Ver Insights**: Genera reportes, insights y dashboards

## 🔐 Seguridad

- Autenticación JWT
- Row Level Security (RLS) en Supabase
- Aislamiento de datos por usuario
- Solo administradores pueden crear usuarios

## 📊 Logs

Visualiza logs en tiempo real:
- Backend: WebSocket en `/api/logs/stream`
- Frontend: Consola flotante en todas las páginas
- Filtros por nivel, módulo y fecha

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver LICENSE para más detalles
