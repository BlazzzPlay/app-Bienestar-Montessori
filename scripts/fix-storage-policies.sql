-- Primero, eliminar políticas existentes que pueden estar causando conflictos
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
DROP POLICY IF EXISTS "avatars_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "avatars_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_authenticated_delete" ON storage.objects;

-- Crear políticas más permisivas para el bucket avatars
-- Política para lectura pública (cualquiera puede ver avatares)
CREATE POLICY "Public read access for avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Política para subida (cualquier usuario autenticado puede subir)
CREATE POLICY "Authenticated upload for avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- Política para actualización (cualquier usuario autenticado puede actualizar)
CREATE POLICY "Authenticated update for avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars');

-- Política para eliminación (cualquier usuario autenticado puede eliminar)
CREATE POLICY "Authenticated delete for avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars');

-- Verificar que RLS esté habilitado en el bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Verificar configuración del bucket
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'avatars';

-- Mostrar políticas activas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
