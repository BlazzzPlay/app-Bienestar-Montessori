-- ============================================
-- Migration: usos_beneficio (hasUsed-persistente)
-- ============================================

-- 1. TABLE
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.usos_beneficio (
  id SERIAL PRIMARY KEY,
  beneficio_id INTEGER NOT NULL REFERENCES public.beneficios(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  fecha_uso TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(beneficio_id, usuario_id)
);

-- 2. INDEXES
-- --------------------------------------------
CREATE INDEX IF NOT EXISTS idx_usos_beneficio_beneficio_usuario
  ON public.usos_beneficio(beneficio_id, usuario_id);

CREATE INDEX IF NOT EXISTS idx_usos_beneficio_usuario
  ON public.usos_beneficio(usuario_id);

-- 3. RLS
-- --------------------------------------------
ALTER TABLE public.usos_beneficio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usos_beneficio_select_auth" ON public.usos_beneficio;
CREATE POLICY "usos_beneficio_select_auth"
  ON public.usos_beneficio FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "usos_beneficio_insert_own" ON public.usos_beneficio;
CREATE POLICY "usos_beneficio_insert_own"
  ON public.usos_beneficio FOR INSERT
  TO authenticated WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "usos_beneficio_delete_admin" ON public.usos_beneficio;
CREATE POLICY "usos_beneficio_delete_admin"
  ON public.usos_beneficio FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'Administrador')
  );

-- 4. UPDATED RPC
-- --------------------------------------------
-- Idempotent: inserts audit row and only increments global counter on first use.
CREATE OR REPLACE FUNCTION public.incrementar_uso_beneficio(p_id integer, p_usuario_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO public.usos_beneficio (beneficio_id, usuario_id)
  VALUES (p_id, p_usuario_id)
  ON CONFLICT (beneficio_id, usuario_id) DO NOTHING;

  IF FOUND THEN
    UPDATE public.beneficios
    SET contador_usos = contador_usos + 1
    WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
