-- ============================================================
-- FUNCIÓN RPC: Aceptar términos (evita problemas de RLS)
-- ============================================================
-- Ejecutar en Supabase SQL Editor
-- Esta función se ejecuta con privilegios elevados (SECURITY DEFINER)
-- evitando problemas de recursión en RLS
-- ============================================================

CREATE OR REPLACE FUNCTION public.accept_user_terms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- Se ejecuta con privilegios del owner (evita RLS)
AS $$
BEGIN
  -- Actualizar terms_accepted_at del usuario actual
  UPDATE public.profiles
  SET terms_accepted_at = NOW(),
      updated_at = NOW()
  WHERE id = auth.uid();

  -- Verificar que se actualizó
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se pudo actualizar el perfil del usuario';
  END IF;
END;
$$;

-- Dar permisos a usuarios autenticados para ejecutar esta función
GRANT EXECUTE ON FUNCTION public.accept_user_terms() TO authenticated;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

-- Ver la función creada
SELECT routine_name, routine_type, security_type
FROM information_schema.routines
WHERE routine_name = 'accept_user_terms';

-- ✅ Debería mostrar: accept_user_terms | FUNCTION | DEFINER

-- ============================================================
-- FIN
-- ============================================================
