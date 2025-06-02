# Configuración Manual del Bucket de Avatares

Como la creación automática de buckets requiere permisos de administrador, necesitas crear el bucket manualmente en el Dashboard de Supabase.

## Pasos para Crear el Bucket

### 1. Acceder al Dashboard de Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto

### 2. Navegar a Storage
1. En el menú lateral, haz clic en **"Storage"**
2. Verás la lista de buckets existentes

### 3. Crear el Bucket "avatars"
1. Haz clic en **"New bucket"** o **"Create bucket"**
2. Configura el bucket con estos valores:
   - **Name:** `avatars`
   - **Public bucket:** ✅ **Activado** (muy importante)
   - **File size limit:** `2097152` (2MB en bytes)
   - **Allowed MIME types:** `image/jpeg,image/png,image/webp`

### 4. Configurar Políticas de Acceso
Una vez creado el bucket, necesitas configurar las políticas:

1. Ve a **Storage > Policies**
2. Busca el bucket "avatars"
3. Crea estas políticas:

#### Política de Lectura Pública
\`\`\`sql
CREATE POLICY "Public read access for avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
\`\`\`

#### Política de Subida para Usuarios Autenticados
\`\`\`sql
CREATE POLICY "Authenticated upload for avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');
\`\`\`

#### Política de Actualización
\`\`\`sql
CREATE POLICY "Authenticated update for avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars');
\`\`\`

#### Política de Eliminación
\`\`\`sql
CREATE POLICY "Authenticated delete for avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars');
\`\`\`

### 5. Verificar la Configuración
1. El bucket debe aparecer como **público**
2. Debe tener un límite de **2MB**
3. Las políticas deben estar activas

## Configuración Alternativa Rápida

Si prefieres usar SQL, puedes ejecutar este script en el **SQL Editor** de Supabase:

\`\`\`sql
-- Insertar bucket en la tabla storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Crear políticas
CREATE POLICY IF NOT EXISTS "Public read access for avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Authenticated upload for avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Authenticated update for avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Authenticated delete for avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars');
\`\`\`

## Verificación
Una vez completada la configuración, el modal de cambio de foto debería mostrar:
- ✅ Conexión DB
- ✅ Bucket avatars
- ✅ Test upload

¡Listo! Ahora puedes subir avatares sin problemas.
