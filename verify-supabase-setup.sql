-- ============================================================
-- SCRIPT DE VERIFICACIÓN POST-SETUP SUPABASE
-- ============================================================
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- Propósito: Verificar que todo se creó correctamente
-- ============================================================

-- ============================================================
-- 1. VERIFICAR TABLAS CREADAS
-- ============================================================

SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'categories', 'transactions', 'budgets', 'savings_goals')
ORDER BY table_name;

-- ✅ Resultado esperado: 5 filas
-- profiles: ~9 columnas
-- categories: ~6 columnas
-- transactions: ~11 columnas
-- budgets: ~6 columnas
-- savings_goals: ~8 columnas

-- ============================================================
-- 2. VERIFICAR CATEGORÍAS SEED (14 categorías por defecto)
-- ============================================================

SELECT
  type,
  COUNT(*) as total,
  STRING_AGG(name, ', ' ORDER BY name) as categorias
FROM public.categories
GROUP BY type
ORDER BY type;

-- ✅ Resultado esperado:
-- ingreso: 4 (Salario, Freelance, Inversiones, Otros Ingresos)
-- gasto: 10 (Alimentación, Transporte, Vivienda, etc.)

-- ============================================================
-- 3. VERIFICAR TRIGGERS/FUNCIONES
-- ============================================================

SELECT
  routine_name as function_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'handle_updated_at', 'auto_populate_month_year')
ORDER BY routine_name;

-- ✅ Resultado esperado: 3 funciones (todas FUNCTION)

-- ============================================================
-- 4. VERIFICAR TRIGGERS ACTIVOS
-- ============================================================

SELECT
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation as event
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ✅ Resultado esperado: 4 triggers
-- on_auth_user_created (auth.users)
-- on_profiles_updated (profiles)
-- on_transactions_updated (transactions)
-- on_transaction_date_set (transactions)
-- on_savings_goals_updated (savings_goals)

-- ============================================================
-- 5. VERIFICAR RLS (Row Level Security) ACTIVADO
-- ============================================================

SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'categories', 'transactions', 'budgets', 'savings_goals')
ORDER BY tablename;

-- ✅ Resultado esperado: Todas las tablas con rls_enabled = true

-- ============================================================
-- 6. VERIFICAR POLÍTICAS RLS
-- ============================================================

SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  CASE
    WHEN policyname ILIKE '%admin%' THEN 'ADMIN'
    WHEN policyname ILIKE '%own%' THEN 'USER'
    ELSE 'PUBLIC'
  END as target_role
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- ✅ Resultado esperado: ~26 políticas distribuidas así:
-- profiles: 4 policies (SELECT, UPDATE admin/user)
-- categories: 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- transactions: 6 policies (SELECT admin/user, INSERT, UPDATE admin/user, DELETE admin/user)
-- budgets: 6 policies (similar a transactions)
-- savings_goals: 6 policies (similar a transactions)

-- ============================================================
-- 7. VERIFICAR ENUMS CREADOS
-- ============================================================

SELECT
  t.typname as enum_name,
  STRING_AGG(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('user_role', 'transaction_type')
GROUP BY t.typname
ORDER BY t.typname;

-- ✅ Resultado esperado:
-- user_role: admin, full_user, partial_user
-- transaction_type: ingreso, gasto

-- ============================================================
-- 8. VERIFICAR USUARIO ADMIN CREADO
-- ============================================================

SELECT
  p.id,
  p.email,
  p.role,
  p.is_active,
  p.terms_accepted_at,
  p.created_at
FROM public.profiles p
WHERE p.role = 'admin'
ORDER BY p.created_at;

-- ✅ Resultado esperado: Al menos 1 fila con tu usuario admin
-- Verificar que:
-- - role = 'admin'
-- - is_active = true

-- ============================================================
-- 9. VERIFICAR SINCRONIZACIÓN auth.users <-> profiles
-- ============================================================

SELECT
  au.email as auth_email,
  au.created_at as auth_created,
  p.email as profile_email,
  p.role as profile_role,
  p.is_active
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;

-- ✅ Resultado esperado: Todos los usuarios tienen perfil
-- Si hay usuarios en auth.users sin perfil, el trigger no funcionó

-- ============================================================
-- 10. VERIFICAR ÍNDICES CREADOS
-- ============================================================

SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('transactions', 'budgets', 'savings_goals')
ORDER BY tablename, indexname;

-- ✅ Resultado esperado: Varios índices, especialmente en:
-- transactions: user_id, date, month_year, category_id
-- budgets: user_id, month_year
-- savings_goals: user_id

-- ============================================================
-- 11. TEST DE POLÍTICAS RLS (Como usuario normal)
-- ============================================================

-- Este query solo funciona si hay un usuario autenticado
-- Para probarlo, debes hacer login desde el frontend

-- SET LOCAL role TO authenticated;
-- SELECT * FROM public.transactions; -- Solo debería ver sus propias transacciones
-- RESET ROLE;

-- ============================================================
-- 12. RESUMEN EJECUTIVO
-- ============================================================

SELECT
  'Tablas creadas' as item,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'categories', 'transactions', 'budgets', 'savings_goals'))::text as valor,
  '5' as esperado,
  CASE WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'categories', 'transactions', 'budgets', 'savings_goals')) = 5 THEN '✅' ELSE '❌' END as status

UNION ALL

SELECT
  'Categorías seed',
  (SELECT COUNT(*)::text FROM public.categories),
  '14',
  CASE WHEN (SELECT COUNT(*) FROM public.categories) = 14 THEN '✅' ELSE '❌' END

UNION ALL

SELECT
  'Funciones creadas',
  (SELECT COUNT(*)::text FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('handle_new_user', 'handle_updated_at', 'auto_populate_month_year')),
  '3',
  CASE WHEN (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('handle_new_user', 'handle_updated_at', 'auto_populate_month_year')) = 3 THEN '✅' ELSE '❌' END

UNION ALL

SELECT
  'RLS activado',
  (SELECT COUNT(*)::text FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true AND tablename IN ('profiles', 'categories', 'transactions', 'budgets', 'savings_goals')),
  '5',
  CASE WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true AND tablename IN ('profiles', 'categories', 'transactions', 'budgets', 'savings_goals')) = 5 THEN '✅' ELSE '❌' END

UNION ALL

SELECT
  'Políticas RLS',
  (SELECT COUNT(*)::text FROM pg_policies WHERE schemaname = 'public'),
  '~26',
  CASE WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 20 THEN '✅' ELSE '❌' END

UNION ALL

SELECT
  'Usuarios admin',
  (SELECT COUNT(*)::text FROM public.profiles WHERE role = 'admin'),
  '>=1',
  CASE WHEN (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') >= 1 THEN '✅' ELSE '⚠️' END

UNION ALL

SELECT
  'ENUMs creados',
  (SELECT COUNT(*)::text FROM pg_type WHERE typname IN ('user_role', 'transaction_type')),
  '2',
  CASE WHEN (SELECT COUNT(*) FROM pg_type WHERE typname IN ('user_role', 'transaction_type')) = 2 THEN '✅' ELSE '❌' END;

-- ✅ Si todos los status son ✅, el setup está completo!

-- ============================================================
-- FIN DEL SCRIPT DE VERIFICACIÓN
-- ============================================================

/*
INTERPRETACIÓN DE RESULTADOS:

✅ = Todo correcto
⚠️ = Advertencia (puede funcionar pero revisar)
❌ = Error crítico (requiere corrección)

Si algún item está en ❌:
1. Revisar el script supabase-migration.sql
2. Volver a ejecutar la sección correspondiente
3. Verificar logs en Supabase Dashboard → Logs

Troubleshooting:
- Si faltan tablas: Re-ejecutar sección de CREATE TABLE
- Si faltan categorías: Re-ejecutar sección de INSERT
- Si RLS no está activo: Re-ejecutar sección ALTER TABLE ENABLE ROW LEVEL SECURITY
- Si faltan políticas: Re-ejecutar sección de CREATE POLICY
- Si no hay admin: Ejecutar UPDATE public.profiles SET role = 'admin' WHERE email = 'tu@email.com'
*/
