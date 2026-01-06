# 🔐 Credenciales de Administrador - DataLIVE

## Acceso Inicial

Para acceder a la aplicación desplegada, usa estas credenciales:

**Email:** `admin@datalive.com`  
**Password:** `admin123`

---

## Actualizar Contraseña en Supabase

### Opción 1: SQL Editor (Recomendado)

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Click en **SQL Editor**
3. Ejecuta esta query:

```sql
UPDATE users 
SET password_hash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
WHERE email = 'admin@datalive.com';
```

4. Click en **Run**

### Opción 2: Table Editor

1. Ve a **Table Editor** → **users**
2. Busca la fila con email `admin@datalive.com`
3. Click en la fila para editarla
4. En el campo `password_hash`, pega:
   ```
   $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
   ```
5. Click en **Save**

---

## Verificar

Después de actualizar el hash:

1. Ve a: https://datalive-ia-gdpd.vercel.app
2. Usa las credenciales:
   - **Email:** admin@datalive.com
   - **Password:** admin123
3. Deberías poder hacer login exitosamente

---

## Cambiar Contraseña Después

Una vez que hayas iniciado sesión, puedes cambiar la contraseña desde la aplicación (cuando implementemos la página de configuración).

---

## Generar Nuevos Hashes

Si necesitas generar un hash para otra contraseña, usa:

```bash
cd backend
npm install
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('TU_CONTRASEÑA', 10, (e,h) => console.log(h));"
```

---

## URLs del Proyecto

- **Frontend:** https://datalive-ia-gdpd.vercel.app
- **Backend:** https://datalive-ia.onrender.com
- **Supabase:** https://supabase.com/dashboard

---

**Última actualización:** 2026-01-06
