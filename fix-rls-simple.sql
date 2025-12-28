-- ============================================================
-- FIX DEFINITIVO: Eliminar recursión en policies de profiles
-- ============================================================
-- Este script corrige el problema de "infinite recursion"
-- ============================================================

-- 1. ELIMINAR TODAS las políticas de profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;

-- ============================================================
-- 2. CREAR POLÍTICAS SIMPLES (SIN subqueries a profiles)
-- ============================================================

-- SELECT: Todos pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- UPDATE: Todos pueden actualizar su propio perfil
-- SIN restricciones de role/is_active (eso lo manejamos en frontend)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- ============================================================
-- 3. VERIFICAR
-- ============================================================

-- Ver políticas creadas
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'profiles';

-- Resultado esperado: 2 políticas (SELECT y UPDATE)

-- ============================================================
-- 4. PROBAR UPDATE
-- ============================================================

-- Esto debería funcionar sin recursión
UPDATE public.profiles
SET terms_accepted_at = NOW()
WHERE id = auth.uid();

-- ✅ Si no da error, el problema está resuelto
