# Guía de Despliegue - DataLIVE

## 1. Configurar Supabase

### Crear Proyecto
1. Ve a [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Espera a que se complete la configuración

### Ejecutar Schema SQL
1. Ve a SQL Editor en Supabase
2. Copia y pega el contenido de `supabase/schema.sql`
3. Ejecuta el script
4. Verifica que todas las tablas se crearon correctamente

### Configurar Storage
1. Ve a Storage en Supabase
2. Crea un bucket llamado `documents`
3. Configura las políticas de acceso:
   - Permitir lectura/escritura para usuarios autenticados

### Obtener Credenciales
1. Ve a Project Settings > API
2. Copia:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

### Crear Usuario Administrador
1. Ve a SQL Editor
2. Ejecuta:
```sql
INSERT INTO users (email, password_hash, full_name, role) 
VALUES (
    'admin@datalive.com',
    '$2b$10$YourHashedPasswordHere',
    'Administrador',
    'admin'
);
```
3. Para generar el hash de contraseña, usa bcrypt con 10 rounds

## 2. Desplegar Backend en Render

### Preparar Repositorio
1. Sube el código a GitHub
2. Asegúrate de que `.gitignore` esté configurado correctamente

### Crear Web Service
1. Ve a [Render](https://render.com)
2. New > Web Service
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Name**: datalive-backend
   - **Region**: Oregon (o el más cercano)
   - **Branch**: main
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Configurar Variables de Entorno
En Environment, agrega:
```
NODE_ENV=production
PORT=10000
SUPABASE_URL=<tu-supabase-url>
SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_KEY=<tu-service-key>
GOOGLE_API_KEY=<tu-google-api-key>
ANTHROPIC_API_KEY=<tu-anthropic-api-key>
JWT_SECRET=<genera-un-secret-aleatorio>
FRONTEND_URL=https://tu-app.vercel.app
```

### Obtener API Keys de IA

#### Google Gemini
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una API key
3. Copia la key → `GOOGLE_API_KEY`

#### Anthropic Claude
1. Ve a [Anthropic Console](https://console.anthropic.com/)
2. Crea una API key
3. Copia la key → `ANTHROPIC_API_KEY`

### Deploy
1. Click en "Create Web Service"
2. Espera a que se complete el despliegue
3. Copia la URL del servicio (ej: `https://datalive-backend.onrender.com`)

## 3. Desplegar Frontend en Vercel

### Preparar Proyecto
1. Asegúrate de que el código esté en GitHub

### Crear Proyecto en Vercel
1. Ve a [Vercel](https://vercel.com)
2. New Project
3. Import tu repositorio
4. Configuración:
   - **Framework Preset**: Next.js
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Configurar Variables de Entorno
En Environment Variables, agrega:
```
NEXT_PUBLIC_API_URL=https://datalive-backend.onrender.com
```

### Deploy
1. Click en "Deploy"
2. Espera a que se complete
3. Copia la URL de producción

### Actualizar Backend
1. Ve a Render
2. Actualiza la variable `FRONTEND_URL` con la URL de Vercel
3. Redeploy el backend

## 4. Verificación

### Backend
1. Visita `https://tu-backend.onrender.com/health`
2. Deberías ver: `{"status":"ok","timestamp":"...","service":"DataLIVE Backend"}`

### Frontend
1. Visita tu URL de Vercel
2. Deberías ver la página de login
3. Intenta hacer login con el usuario administrador

### Logs
1. En Render: Ve a Logs para ver los logs del backend
2. En Vercel: Ve a Deployments > Logs para ver los logs del frontend

## 5. Configuración Inicial

### Crear Usuario de Prueba
1. Login como administrador
2. Ve a Administración
3. Crea un usuario de prueba

### Crear Proyecto de Prueba
1. Ve a Proyectos
2. Crea un nuevo proyecto
3. Sube un documento de prueba
4. Verifica que el análisis de IA funcione

### Configurar Modelos de IA
1. Ve a Configuración
2. Selecciona tus modelos preferidos para cada tarea
3. Guarda los cambios

## 6. Monitoreo

### Logs en Tiempo Real
- El sistema de logging está configurado para mostrar logs en tiempo real
- Puedes ver los logs en la sección "Logs" del dashboard

### Errores Comunes

#### Error de CORS
- Verifica que `FRONTEND_URL` en el backend coincida con tu URL de Vercel
- Verifica que `NEXT_PUBLIC_API_URL` en el frontend coincida con tu URL de Render

#### Error de Autenticación
- Verifica que `JWT_SECRET` esté configurado
- Verifica que las credenciales de Supabase sean correctas

#### Error de IA
- Verifica que las API keys de Google y Anthropic sean válidas
- Verifica que tengas créditos disponibles en ambas plataformas

## 7. Mantenimiento

### Actualizar Código
1. Push cambios a GitHub
2. Render y Vercel se redesplegarán automáticamente

### Backup de Base de Datos
- Supabase hace backups automáticos
- Puedes exportar datos manualmente desde el dashboard

### Limpiar Logs Antiguos
- Los logs se pueden limpiar desde la API: `DELETE /api/logs?days=30`
- O desde el dashboard en la sección de Logs

## 8. Costos Estimados

### Free Tier
- **Supabase**: 500MB DB, 1GB Storage, 2GB Bandwidth
- **Render**: 750 horas/mes (suficiente para 1 servicio 24/7)
- **Vercel**: 100GB Bandwidth, Unlimited Deployments
- **Google Gemini**: Cuota gratuita limitada
- **Anthropic Claude**: Requiere pago

### Escalamiento
Si necesitas más recursos:
- **Supabase Pro**: $25/mes
- **Render Starter**: $7/mes
- **Vercel Pro**: $20/mes

## Soporte

Para problemas o preguntas:
1. Revisa los logs en Render y Vercel
2. Verifica la consola del navegador
3. Revisa la sección de Logs en el dashboard
