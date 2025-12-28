-- ============================================================
-- DEBUG: Verificar estado de RLS en profiles
-- ============================================================

-- 1. Ver si RLS está activado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- 2. Ver todas las políticas actuales
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 3. Verificar usuarios actuales
SELECT id, email, role, is_active, terms_accepted_at
FROM public.profiles;

-- ============================================================
-- OPCIÓN: Desactivar RLS temporalmente para pruebas
-- ============================================================
-- ⚠️ SOLO PARA DESARROLLO - Nunca en producción

-- Desactivar RLS en profiles (temporal)
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Si esto funciona, el problema es definitivamente RLS
-- Recuerda reactivarlo después:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
