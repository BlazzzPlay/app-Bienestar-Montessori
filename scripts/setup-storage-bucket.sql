-- Verificar si el bucket avatars existe
DO $$
BEGIN
    -- Intentar crear el bucket si no existe
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'avatars',
        'avatars', 
        true,
        2097152, -- 2MB límite por archivo (más estricto para ahorrar espacio)
        ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
    )
    ON CONFLICT (id) DO UPDATE SET
        public = true,
        file_size_limit = 2097152,
        allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[];
    
    RAISE NOTICE 'Bucket avatars configurado correctamente';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error configurando bucket: %', SQLERRM;
END $$;

-- Crear políticas de acceso para el bucket avatars
DO $$
BEGIN
    -- Política para lectura pública
    INSERT INTO storage.policies (id, bucket_id, name, definition)
    VALUES (
        'avatars_public_read',
        'avatars',
        'Public read access for avatars',
        '{"role": "anon", "command": "SELECT", "using": "bucket_id = ''avatars''"}'::jsonb
    )
    ON CONFLICT (id) DO NOTHING;

    -- Política para subida autenticada
    INSERT INTO storage.policies (id, bucket_id, name, definition)
    VALUES (
        'avatars_authenticated_upload',
        'avatars',
        'Authenticated users can upload avatars',
        '{"role": "authenticated", "command": "INSERT", "using": "bucket_id = ''avatars''"}'::jsonb
    )
    ON CONFLICT (id) DO NOTHING;

    -- Política para actualización autenticada
    INSERT INTO storage.policies (id, bucket_id, name, definition)
    VALUES (
        'avatars_authenticated_update',
        'avatars',
        'Authenticated users can update avatars',
        '{"role": "authenticated", "command": "UPDATE", "using": "bucket_id = ''avatars''"}'::jsonb
    )
    ON CONFLICT (id) DO NOTHING;

    -- Política para eliminación autenticada
    INSERT INTO storage.policies (id, bucket_id, name, definition)
    VALUES (
        'avatars_authenticated_delete',
        'avatars',
        'Authenticated users can delete avatars',
        '{"role": "authenticated", "command": "DELETE", "using": "bucket_id = ''avatars''"}'::jsonb
    )
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Políticas de acceso configuradas correctamente';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error configurando políticas: %', SQLERRM;
END $$;

-- Verificar configuración final
SELECT 
    b.id,
    b.name,
    b.public,
    b.file_size_limit,
    b.allowed_mime_types,
    b.created_at
FROM storage.buckets b 
WHERE b.id = 'avatars';

-- Mostrar políticas configuradas
SELECT 
    p.id,
    p.bucket_id,
    p.name,
    p.definition
FROM storage.policies p 
WHERE p.bucket_id = 'avatars';
