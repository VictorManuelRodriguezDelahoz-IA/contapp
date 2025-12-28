-- ============================================================
-- SUPABASE MIGRATION SCRIPT - FinanzasApp
-- ============================================================
-- Este script debe ejecutarse en el SQL Editor de Supabase
-- Crea toda la infraestructura: Enums, Tablas, Triggers, RLS
-- ============================================================

-- ============================================================
-- 1. CREAR ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'full_user', 'partial_user');
CREATE TYPE transaction_type AS ENUM ('ingreso', 'gasto');

-- ============================================================
-- 2. CREAR TABLAS
-- ============================================================

-- ------------------------------------------------------------
-- 2.1 PROFILES (Sincronizada con auth.users)
-- ------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'full_user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  terms_accepted_at TIMESTAMPTZ,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Perfiles de usuario extendidos sincronizados con auth.users';
COMMENT ON COLUMN public.profiles.role IS 'admin: acceso total | full_user: uso completo | partial_user: acceso limitado';
COMMENT ON COLUMN public.profiles.is_active IS 'Admin puede bloquear usuarios estableciendo false';
COMMENT ON COLUMN public.profiles.terms_accepted_at IS 'NULL = no aceptó términos, TIMESTAMPTZ = fecha de aceptación';

-- ------------------------------------------------------------
-- 2.2 CATEGORIES (Global, compartida entre usuarios)
-- ------------------------------------------------------------
CREATE TABLE public.categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type transaction_type NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon TEXT NOT NULL DEFAULT '💰',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.categories IS 'Categorías de ingresos/gastos compartidas entre usuarios';
COMMENT ON COLUMN public.categories.is_system IS 'true = categoría por defecto del sistema, false = personalizada';

-- ------------------------------------------------------------
-- 2.3 TRANSACTIONS (Ingresos y Gastos por usuario)
-- ------------------------------------------------------------
CREATE TABLE public.transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  type transaction_type NOT NULL,
  category_id BIGINT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2000),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_transactions_month_year ON public.transactions(month, year);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);

COMMENT ON TABLE public.transactions IS 'Transacciones financieras (ingresos/gastos) por usuario';
COMMENT ON COLUMN public.transactions.user_id IS 'FK a profiles - cada transacción pertenece a un usuario';
COMMENT ON COLUMN public.transactions.amount IS 'Monto en COP (Colombian Pesos)';

-- ------------------------------------------------------------
-- 2.4 BUDGETS (Presupuestos mensuales por usuario)
-- ------------------------------------------------------------
CREATE TABLE public.budgets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, category_id, month, year)
);

CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_budgets_month_year ON public.budgets(month, year);

COMMENT ON TABLE public.budgets IS 'Presupuestos mensuales por categoría y usuario';
COMMENT ON COLUMN public.budgets.user_id IS 'FK a profiles - cada presupuesto pertenece a un usuario';

-- ------------------------------------------------------------
-- 2.5 SAVINGS_GOALS (Metas de ahorro por usuario)
-- ------------------------------------------------------------
CREATE TABLE public.savings_goals (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  deadline TIMESTAMPTZ,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_savings_goals_user_id ON public.savings_goals(user_id);

COMMENT ON TABLE public.savings_goals IS 'Metas de ahorro personales por usuario';
COMMENT ON COLUMN public.savings_goals.user_id IS 'FK a profiles - cada meta pertenece a un usuario';

-- ============================================================
-- 3. TRIGGERS (Auto-gestión de datos)
-- ============================================================

-- ------------------------------------------------------------
-- 3.1 Auto-crear profile cuando se registra un usuario
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'full_user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-crea perfil en public.profiles cuando se registra usuario en auth.users';

-- ------------------------------------------------------------
-- 3.2 Auto-actualizar updated_at en profiles
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_transactions_updated
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_savings_goals_updated
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON FUNCTION public.handle_updated_at() IS 'Auto-actualiza columna updated_at en tablas relevantes';

-- ------------------------------------------------------------
-- 3.3 Auto-completar month/year en transactions
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auto_populate_month_year()
RETURNS TRIGGER AS $$
BEGIN
  NEW.month := EXTRACT(MONTH FROM NEW.date);
  NEW.year := EXTRACT(YEAR FROM NEW.date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_transaction_date_set
  BEFORE INSERT OR UPDATE OF date ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.auto_populate_month_year();

COMMENT ON FUNCTION public.auto_populate_month_year() IS 'Auto-extrae month y year de la columna date en transactions';

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS) - POLÍTICAS ESTRICTAS
-- ============================================================

-- HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4.1 POLICIES - PROFILES
-- ============================================================

-- Admin: Ver todos los perfiles
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Usuario: Ver solo su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Usuario: Actualizar solo su propio perfil (excepto role, is_active)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND
    -- No pueden cambiar su propio role o is_active
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
    is_active = (SELECT is_active FROM public.profiles WHERE id = auth.uid())
  );

-- Admin: Actualizar cualquier perfil (incluyendo role, is_active)
CREATE POLICY "Admin can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- ============================================================
-- 4.2 POLICIES - CATEGORIES (Global, compartida)
-- ============================================================

-- Todos los usuarios autenticados pueden leer categorías
CREATE POLICY "Authenticated users can read categories"
  ON public.categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Solo ADMIN puede crear categorías
CREATE POLICY "Admin can create categories"
  ON public.categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Solo ADMIN puede actualizar categorías
CREATE POLICY "Admin can update categories"
  ON public.categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Solo ADMIN puede eliminar categorías
CREATE POLICY "Admin can delete categories"
  ON public.categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- ============================================================
-- 4.3 POLICIES - TRANSACTIONS
-- ============================================================

-- Admin: Ver TODAS las transacciones de TODOS los usuarios
CREATE POLICY "Admin can view all transactions"
  ON public.transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Usuario: Ver solo sus propias transacciones
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (user_id = auth.uid());

-- Usuario: Crear transacciones solo para sí mismo
CREATE POLICY "Users can create own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_active = true AND terms_accepted_at IS NOT NULL
    )
  );

-- Usuario: Actualizar solo sus propias transacciones
CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin: Actualizar/Eliminar cualquier transacción
CREATE POLICY "Admin can update any transaction"
  ON public.transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Usuario: Eliminar solo sus propias transacciones
CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (user_id = auth.uid());

-- Admin: Eliminar cualquier transacción
CREATE POLICY "Admin can delete any transaction"
  ON public.transactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- ============================================================
-- 4.4 POLICIES - BUDGETS (Misma lógica que transactions)
-- ============================================================

-- Admin: Ver todos los presupuestos
CREATE POLICY "Admin can view all budgets"
  ON public.budgets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Usuario: Ver solo sus propios presupuestos
CREATE POLICY "Users can view own budgets"
  ON public.budgets FOR SELECT
  USING (user_id = auth.uid());

-- Usuario: Crear presupuestos solo para sí mismo
CREATE POLICY "Users can create own budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_active = true AND terms_accepted_at IS NOT NULL
    )
  );

-- Usuario: Actualizar/Eliminar solo sus propios presupuestos
CREATE POLICY "Users can update own budgets"
  ON public.budgets FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own budgets"
  ON public.budgets FOR DELETE
  USING (user_id = auth.uid());

-- Admin: Actualizar/Eliminar cualquier presupuesto
CREATE POLICY "Admin can update any budget"
  ON public.budgets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

CREATE POLICY "Admin can delete any budget"
  ON public.budgets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- ============================================================
-- 4.5 POLICIES - SAVINGS_GOALS (Misma lógica que transactions)
-- ============================================================

-- Admin: Ver todas las metas de ahorro
CREATE POLICY "Admin can view all savings goals"
  ON public.savings_goals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Usuario: Ver solo sus propias metas
CREATE POLICY "Users can view own savings goals"
  ON public.savings_goals FOR SELECT
  USING (user_id = auth.uid());

-- Usuario: Crear metas solo para sí mismo
CREATE POLICY "Users can create own savings goals"
  ON public.savings_goals FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_active = true AND terms_accepted_at IS NOT NULL
    )
  );

-- Usuario: Actualizar/Eliminar solo sus propias metas
CREATE POLICY "Users can update own savings goals"
  ON public.savings_goals FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own savings goals"
  ON public.savings_goals FOR DELETE
  USING (user_id = auth.uid());

-- Admin: Actualizar/Eliminar cualquier meta
CREATE POLICY "Admin can update any savings goal"
  ON public.savings_goals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

CREATE POLICY "Admin can delete any savings goal"
  ON public.savings_goals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- ============================================================
-- 5. SEED DATA - Categorías por defecto
-- ============================================================

INSERT INTO public.categories (name, type, color, icon, is_system) VALUES
  -- Ingresos
  ('Salario', 'ingreso', '#10b981', '💼', true),
  ('Freelance', 'ingreso', '#059669', '💻', true),
  ('Inversiones', 'ingreso', '#34d399', '📈', true),
  ('Otros Ingresos', 'ingreso', '#6ee7b7', '💵', true),

  -- Gastos
  ('Alimentación', 'gasto', '#ef4444', '🍔', true),
  ('Transporte', 'gasto', '#f97316', '🚗', true),
  ('Vivienda', 'gasto', '#f59e0b', '🏠', true),
  ('Servicios', 'gasto', '#eab308', '💡', true),
  ('Salud', 'gasto', '#ec4899', '🏥', true),
  ('Educación', 'gasto', '#8b5cf6', '📚', true),
  ('Entretenimiento', 'gasto', '#6366f1', '🎮', true),
  ('Ropa', 'gasto', '#06b6d4', '👕', true),
  ('Ahorro', 'gasto', '#14b8a6', '🏦', true),
  ('Otros Gastos', 'gasto', '#64748b', '💸', true);

-- ============================================================
-- 6. CREAR PRIMER USUARIO ADMIN
-- ============================================================
-- NOTA: Este usuario debe crearse desde el panel de Supabase Auth
-- Luego actualizar su perfil con este SQL:

-- UPDATE public.profiles
-- SET role = 'admin', is_active = true
-- WHERE email = 'admin@finanzasapp.com';

-- ============================================================
-- 7. RESUMEN DE PERMISOS POR ROL
-- ============================================================

/*
┌─────────────────┬──────────────┬────────────┬────────────┬────────────┐
│     TABLA       │     ADMIN    │ FULL_USER  │PARTIAL_USER│   ACCIÓN   │
├─────────────────┼──────────────┼────────────┼────────────┼────────────┤
│ profiles        │ Ver todos    │ Ver propio │ Ver propio │ SELECT     │
│                 │ Editar todos │ Editar*    │ Editar*    │ UPDATE     │
├─────────────────┼──────────────┼────────────┼────────────┼────────────┤
│ categories      │ CRUD total   │ Solo leer  │ Solo leer  │ ALL        │
│                 │ Crear ✅     │ Crear ❌   │ Crear ❌   │ INSERT     │
│                 │ Editar ✅    │ Editar ❌  │ Editar ❌  │ UPDATE     │
│                 │ Eliminar ✅  │ Eliminar ❌│ Eliminar ❌│ DELETE     │
├─────────────────┼──────────────┼────────────┼────────────┼────────────┤
│ transactions    │ Ver TODOS    │ Ver propias│ Ver propias│ SELECT     │
│                 │ CRUD TODOS   │ CRUD propio│ CRUD propio│ ALL        │
├─────────────────┼──────────────┼────────────┼────────────┼────────────┤
│ budgets         │ Ver TODOS    │ Ver propios│ Ver propios│ SELECT     │
│                 │ CRUD TODOS   │ CRUD propio│ CRUD propio│ ALL        │
├─────────────────┼──────────────┼────────────┼────────────┼────────────┤
│ savings_goals   │ Ver TODOS    │ Ver propias│ Ver propias│ SELECT     │
│                 │ CRUD TODOS   │ CRUD propio│ CRUD propio│ ALL        │
└─────────────────┴──────────────┴────────────┴────────────┴────────────┘

* No pueden modificar su propio 'role' o 'is_active'

RESTRICCIONES FRONTEND (no a nivel de base de datos):
- partial_user: Acceso a TODO excepto Calculadora de Impuestos
- full_user: Acceso completo a toda la app
- admin: Acceso total + Panel de Administración + Gestión de Categorías
*/

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================

-- VERIFICACIÓN: Ejecutar estas queries para confirmar
-- SELECT * FROM public.profiles;
-- SELECT * FROM public.categories;
-- SELECT * FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
