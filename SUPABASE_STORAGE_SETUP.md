# Configuración de Supabase Storage

## Error Actual
```
Bucket not found
```

## Solución: Crear Bucket de Storage

### Paso 1: Ir a Supabase Storage

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Click en **Storage** en el menú lateral

### Paso 2: Crear Bucket "documents"

1. Click en **"New bucket"** o **"Create a new bucket"**
2. Configuración del bucket:
   - **Name:** `documents`
   - **Public bucket:** ❌ NO (debe ser privado)
   - **File size limit:** 50 MB
   - **Allowed MIME types:** `application/pdf` (opcional)

3. Click en **"Create bucket"**

### Paso 3: Configurar Políticas de Acceso (RLS)

Una vez creado el bucket, necesitas configurar las políticas de acceso:

#### Opción A: Políticas Automáticas (Recomendado)

1. Click en el bucket `documents`
2. Ve a la pestaña **"Policies"**
3. Click en **"New policy"**
4. Selecciona **"For full customization"**

**Política 1: Permitir INSERT (Upload)**
```sql
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE user_id = auth.uid()
  )
);
```

**Política 2: Permitir SELECT (Download)**
```sql
CREATE POLICY "Users can download their documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE user_id = auth.uid()
  )
);
```

**Política 3: Permitir DELETE**
```sql
CREATE POLICY "Users can delete their documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE user_id = auth.uid()
  )
);
```

#### Opción B: Política Simple (Para Testing)

Si solo quieres probar rápidamente, puedes usar esta política más permisiva:

```sql
-- SOLO PARA TESTING - NO USAR EN PRODUCCIÓN
CREATE POLICY "Allow all operations for authenticated users"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');
```

### Paso 4: Verificar Configuración

1. Ve a **Storage** → **documents**
2. Deberías ver el bucket vacío
3. Las políticas deberían estar activas

### Paso 5: Probar Upload

1. Ve a tu aplicación: https://datalive-ia-gdpd.vercel.app
2. Crea un proyecto
3. Intenta subir un PDF
4. Debería funcionar correctamente

---

## Troubleshooting

### Si sigue sin funcionar:

1. **Verifica el nombre del bucket:**
   - Debe ser exactamente `documents` (minúsculas, sin espacios)

2. **Verifica las variables de entorno en Render:**
   - `SUPABASE_URL` debe estar configurada
   - `SUPABASE_SERVICE_KEY` debe ser la **service_role key** (no la anon key)

3. **Verifica los permisos:**
   - El service_role key bypasea RLS, así que debería funcionar
   - Si usas anon key, necesitas las políticas RLS

### Obtener Service Role Key

1. Ve a Supabase → **Settings** → **API**
2. Copia la **service_role** key (no la anon key)
3. Configúrala en Render como `SUPABASE_SERVICE_KEY`

---

## Configuración Completa de Supabase

### Buckets Necesarios

| Bucket | Público | Descripción |
|--------|---------|-------------|
| `documents` | ❌ No | PDFs y documentación |

### Variables de Entorno Necesarias

```bash
# En Render
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc... (service_role key)

# En Vercel
NEXT_PUBLIC_API_URL=https://datalive-ia.onrender.com
```

---

**Una vez configurado el bucket, la aplicación funcionará completamente.** 🚀
