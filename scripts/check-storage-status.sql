-- Script seguro que solo verifica el estado actual sin intentar modificar nada
-- Este script debería funcionar sin permisos de propietario

-- Verificar buckets existentes
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
ORDER BY created_at DESC;

-- Verificar políticas existentes (si tenemos acceso)
SELECT 
    policyname,
    tablename,
    schemaname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'storage'
ORDER BY tablename, policyname;

-- Verificar objetos existentes en storage (si hay alguno)
SELECT 
    name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    metadata
FROM storage.objects
LIMIT 10;
