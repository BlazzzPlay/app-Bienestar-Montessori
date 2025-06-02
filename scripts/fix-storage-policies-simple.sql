-- Solo crear/actualizar las políticas que podemos manejar
-- (No intentar modificar la tabla storage.objects directamente)

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete for avatars" ON storage.objects;

-- Crear políticas más permisivas
CREATE POLICY "Public read access for avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated upload for avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated update for avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated delete for avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars');

-- Verificar que el bucket existe y está configurado correctamente
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'avatars';

-- Mostrar políticas activas para verificar
SELECT 
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatars%';
