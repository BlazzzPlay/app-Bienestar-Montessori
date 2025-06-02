-- Crear el bucket de avatares si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Crear políticas de acceso para el bucket
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload for avatars" ON storage.objects;

-- Política para lectura pública (cualquiera puede ver avatares)
CREATE POLICY "Public read access for avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Política para subida (cualquier usuario autenticado puede subir)
CREATE POLICY "Authenticated upload for avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');
