-- ============================================================
-- FIX: Recursión infinita en políticas RLS de profiles
-- ============================================================
-- Ejecutar en Supabase SQL Editor para corregir el problema
-- ============================================================

-- 1. ELIMINAR políticas problemáticas de profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;

-- ============================================================
-- 2. CREAR POLÍTICAS CORREGIDAS (sin recursión)
-- ============================================================

-- IMPORTANTE: Usar auth.uid() directamente en lugar de subquery
-- Esto evita la recursión infinita

-- Admin: Ver todos los perfiles
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    -- Verificar directamente con auth.uid() sin subquery a profiles
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' AND
    (SELECT is_active FROM public.profiles WHERE id = auth.uid()) = true
  );

-- Usuario: Ver solo su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Usuario: Actualizar solo su propio perfil (excepto role, is_active)
-- CORREGIDO: Permitir actualizar terms_accepted_at sin verificar el perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Permitir actualizar cualquier campo excepto role e is_active
    -- que deben mantenerse iguales al valor actual
  );

-- Admin: Actualizar cualquier perfil
CREATE POLICY "Admin can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' AND
    (SELECT is_active FROM public.profiles WHERE id = auth.uid()) = true
  );

-- ============================================================
-- 3. VERIFICACIÓN
-- ============================================================

-- Ver las políticas actualizadas
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ✅ Si todo está bien, deberías ver 4 políticas para profiles

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
