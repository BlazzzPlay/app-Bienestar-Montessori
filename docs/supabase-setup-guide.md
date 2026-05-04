# Guía de Configuración de Supabase Storage

## Problema: "Bucket not found"

Este error indica que el bucket de almacenamiento no existe o no está configurado correctamente en Supabase.

## Solución Paso a Paso

### 1. Verificar Variables de Entorno

Asegúrate de que estas variables estén configuradas en tu archivo `.env.local`:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
\`\`\`

### 2. Crear el Bucket en Supabase

1. Ve al Dashboard de Supabase
2. Navega a **Storage** en el menú lateral
3. Haz clic en **"Create bucket"**
4. Configura el bucket:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Habilitado
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: `image/jpeg,image/png,image/gif,image/webp,image/bmp`

### 3. Configurar Políticas de Acceso

Ejecuta estos comandos SQL en el **SQL Editor** de Supabase:

\`\`\`sql
-- Política para lectura pública
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Política para subida autenticada
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Política para actualización autenticada
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Política para eliminación autenticada
CREATE POLICY "Users can delete own avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
\`\`\`

### 4. Verificar Configuración

Usa la herramienta de diagnóstico integrada:

\`\`\`typescript
import { supabaseDiagnostics } from '@/lib/supabase-diagnostics'

// Ejecutar diagnóstico completo
const report = await supabaseDiagnostics.generateDiagnosticReport('avatars')
console.log(report)
\`\`\`

### 5. Solución de Problemas Comunes

#### Error: "Bucket not found"

- Verifica que el bucket existe en Storage
- Confirma que el nombre es exactamente `avatars`

#### Error: "Permission denied"

- Revisa las políticas de acceso
- Asegúrate de que el usuario esté autenticado

#### Error: "Network timeout"

- Verifica la conexión a internet
- Confirma que la URL del proyecto es correcta

### 6. Fallback Local

Si persisten los problemas, el sistema incluye un fallback automático que:

- Almacena imágenes temporalmente en el navegador
- Permite continuar usando la aplicación
- Se activa automáticamente cuando falla Supabase

### 7. Comandos de Verificación

\`\`\`bash

# Verificar conectividad

curl -I https://tu-proyecto.supabase.co/storage/v1/bucket/avatars

# Probar subida (requiere token)

curl -X POST https://tu-proyecto.supabase.co/storage/v1/object/avatars/test.jpg \
 -H "Authorization: Bearer tu-token" \
 -F file=@test.jpg
\`\`\`

## Características del Sistema Mejorado

### ✅ Diagnóstico Automático

- Verifica conexión a Supabase
- Valida existencia del bucket
- Prueba permisos de lectura/escritura
- Genera reporte detallado

### ✅ Manejo Robusto de Errores

- Reintentos automáticos (hasta 3 intentos)
- Fallback a almacenamiento local
- Mensajes de error informativos
- Opciones de recuperación

### ✅ Validaciones Exhaustivas

- Formato de archivo
- Tamaño máximo
- Dimensiones mínimas
- Integridad de imagen

### ✅ Procesamiento Inteligente

- Redimensionamiento automático
- Compresión optimizada
- Conversión a JPEG
- Nomenclatura segura con RUT y fecha

## Contacto de Soporte

Si los problemas persisten después de seguir esta guía:

1. Ejecuta el diagnóstico automático
2. Copia el reporte generado
3. Contacta al administrador del sistema
   \`\`\`
