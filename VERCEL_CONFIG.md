# 🚨 Configuración Importante de Vercel

## Problema Detectado

Vercel no puede encontrar Next.js porque el proyecto está en el subdirectorio `frontend/`.

## ✅ Solución

### Opción 1: Configurar en Dashboard de Vercel (RECOMENDADO)

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **Settings**
3. En la sección **General** → **Root Directory**
4. Cambia de `.` (raíz) a `frontend`
5. Click en **Save**
6. Redeploy el proyecto

### Opción 2: Mover archivos a la raíz

Si prefieres tener Next.js en la raíz del proyecto:

```bash
# Mover archivos de frontend/ a la raíz
mv frontend/* .
mv frontend/.* . 2>/dev/null || true
rmdir frontend

# Actualizar vercel.json (ya está configurado)
# Commit y push
git add .
git commit -m "refactor: Mover frontend a raíz del proyecto"
git push
```

## 📝 Cambios Realizados

### 1. Next.js Actualizado
- ✅ Versión: `15.2.0` (sin vulnerabilidades)
- ✅ Resuelve: CVE-2025-66478

### 2. vercel.json Actualizado
```json
{
    "buildCommand": "npm run build",
    "outputDirectory": ".next",
    "framework": "nextjs",
    "installCommand": "npm install"
}
```

### 3. Commits Realizados
- ✅ `fix: Actualizar Next.js a 15.2.0 y corregir configuración de Vercel`
- ✅ Pusheado a GitHub

## 🎯 Próximos Pasos

### En Vercel Dashboard:

1. **Settings** → **General** → **Root Directory**: `frontend`
2. **Save**
3. **Deployments** → Click en el último deployment
4. Click en **Redeploy**

### Variables de Entorno en Vercel:

Asegúrate de configurar:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com
```

## 🔍 Verificación

Después de configurar el Root Directory, el build debería:

1. ✅ Detectar Next.js correctamente
2. ✅ No mostrar advertencias de seguridad
3. ✅ Completar el build exitosamente
4. ✅ Desplegar la aplicación

## 📞 Si Sigues Teniendo Problemas

### Error: "No Next.js version detected"
- Verifica que Root Directory = `frontend`
- Verifica que `frontend/package.json` existe
- Redeploy después de cambiar configuración

### Error: "Security vulnerability"
- Verifica que `package.json` tenga `"next": "15.2.0"`
- Haz un nuevo commit si es necesario
- Redeploy

### Error de Build
- Revisa los logs en Vercel
- Verifica que todas las dependencias estén en `package.json`
- Verifica que `NEXT_PUBLIC_API_URL` esté configurado

---

**Última actualización**: 2026-01-06  
**Next.js**: 15.2.0 (seguro)  
**Root Directory**: `frontend/`
