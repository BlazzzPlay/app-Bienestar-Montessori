-- Crear bucket de avatares
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Eliminar políticas existentes si existen (sin errores)
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete for avatars" ON storage.objects;

-- Crear políticas de acceso
CREATE POLICY "Public read access for avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated upload for avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated update for avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated delete for avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars');
