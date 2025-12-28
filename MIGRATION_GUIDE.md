# 🔄 Guía de Migración a Supabase - FinanzasApp

Documentación completa de la migración de SQLite + JWT custom a Supabase con arquitectura híbrida.

---

## 📊 Resumen de la Migración

### Antes (Legacy)
```
Frontend (React) → Backend (FastAPI) → SQLite
                   ↓
              JWT Custom (python-jose)
```

### Después (Arquitectura Híbrida)
```
Frontend (React) → Supabase Auth (JWT)
                   ↓ Bearer Token
                   Backend (FastAPI) → Supabase (PostgreSQL)
                   ↓
              Valida Token + Lógica de negocio
```

---

## ✅ Lo que se completó

### 1. Base de Datos (100%)
- ✅ Proyecto Supabase creado
- ✅ 5 tablas migradas: `profiles`, `categories`, `transactions`, `budgets`, `savings_goals`
- ✅ RLS (Row Level Security) configurado
- ✅ Triggers automáticos creados
- ✅ Función RPC `accept_user_terms()` implementada
- ✅ 14 categorías seed insertadas

### 2. Autenticación (100%)
- ✅ Migrado de JWT custom a Supabase Auth
- ✅ Login con email/password implementado
- ✅ Sistema de roles: `admin`, `full_user`, `partial_user`
- ✅ Modal de términos y condiciones (bloqueante)
- ✅ Validación de cuenta activa (`is_active`)

### 3. Backend (100%)
- ✅ Cliente de Supabase configurado
- ✅ Validación de tokens JWT de Supabase
- ✅ CRUD completo usando Supabase PostgreSQL
- ✅ Endpoints de resúmenes y agregaciones
- ✅ Calculadora de impuestos (sin autenticación)
- ✅ Entorno virtual Python configurado
- ✅ Dependencias actualizadas a versiones compatibles

### 4. Frontend (100%)
- ✅ Cliente de Supabase integrado
- ✅ Hook `useAuth` con Supabase Auth
- ✅ Componente `ProtectedRoute` con validaciones
- ✅ Modal de términos implementado
- ✅ Variables de entorno configuradas
- ✅ Restricciones por rol implementadas

---

## 🗄️ Esquema de Base de Datos

### Tablas

#### `profiles`
```sql
id UUID PRIMARY KEY (FK → auth.users)
email TEXT UNIQUE NOT NULL
full_name TEXT
role user_role NOT NULL DEFAULT 'full_user'
is_active BOOLEAN NOT NULL DEFAULT true
terms_accepted_at TIMESTAMPTZ
avatar_url TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

#### `categories`
```sql
id BIGSERIAL PRIMARY KEY
name TEXT UNIQUE NOT NULL
type transaction_type NOT NULL
color TEXT DEFAULT '#6366f1'
icon TEXT DEFAULT '💰'
is_system BOOLEAN DEFAULT false
created_at TIMESTAMPTZ
```

#### `transactions`
```sql
id BIGSERIAL PRIMARY KEY
user_id UUID NOT NULL (FK → profiles)
description TEXT NOT NULL
amount NUMERIC(12,2) NOT NULL
type transaction_type NOT NULL
category_id BIGINT NOT NULL (FK → categories)
date DATE NOT NULL
month INTEGER NOT NULL
year INTEGER NOT NULL
notes TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

#### `budgets`
```sql
id BIGSERIAL PRIMARY KEY
user_id UUID NOT NULL (FK → profiles)
category_id BIGINT NOT NULL (FK → categories)
amount NUMERIC(12,2) NOT NULL
month INTEGER NOT NULL
year INTEGER NOT NULL
created_at TIMESTAMPTZ
UNIQUE(user_id, category_id, month, year)
```

#### `savings_goals`
```sql
id BIGSERIAL PRIMARY KEY
user_id UUID NOT NULL (FK → profiles)
name TEXT NOT NULL
target_amount NUMERIC(12,2) NOT NULL
current_amount NUMERIC(12,2) DEFAULT 0
deadline TIMESTAMPTZ
completed BOOLEAN DEFAULT false
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

---

## 🔒 Row Level Security (RLS)

### Políticas por Tabla

#### `profiles`
- ✅ Usuarios pueden ver solo su propio perfil
- ✅ Usuarios pueden actualizar su perfil (excepto `role` e `is_active`)
- ✅ Admin puede ver y actualizar todos los perfiles

#### `categories`
- ✅ Usuarios autenticados pueden leer todas las categorías
- ✅ Solo admin puede crear/actualizar/eliminar categorías

#### `transactions`, `budgets`, `savings_goals`
- ✅ Usuarios pueden ver/crear/actualizar/eliminar solo sus propios datos
- ✅ Admin puede ver/editar/eliminar datos de todos los usuarios

---

## 🔄 Flujo de Autenticación

### 1. Login
```typescript
// Frontend
const { data } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
const token = data.session.access_token
```

### 2. Validación de Términos
```typescript
// Si terms_accepted_at es NULL
if (!profile.terms_accepted_at) {
  // Mostrar modal bloqueante
  await acceptTerms() // Llama a RPC accept_user_terms()
}
```

### 3. Request al Backend
```typescript
axios.get('http://localhost:8000/api/financial/transactions', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### 4. Validación en Backend
```python
# backend/auth.py
user_response = client.auth.get_user(token)
profile = client.table('profiles').select('*').eq('id', user.id).single()

# Verificaciones
if not profile.is_active:
    raise HTTPException(403, "Cuenta desactivada")
if not profile.terms_accepted_at:
    raise HTTPException(403, "Debe aceptar términos")
```

---

## 📁 Archivos Modificados

### Backend
| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `main.py` | ✅ Reescrito | Entry point + Calculadora |
| `database.py` | ✅ Reescrito | Cliente Supabase |
| `auth.py` | ✅ Reescrito | Validación JWT Supabase |
| `financial_routes.py` | ✅ Reescrito | Endpoints con Supabase |
| `models.py` | ✅ Actualizado | Pydantic V2 |
| `requirements.txt` | ✅ Actualizado | Dependencias compatibles |
| `.env` | ✅ Configurado | Credenciales Supabase |

### Frontend
| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `lib/supabaseClient.ts` | ✅ Creado | Cliente Supabase |
| `hooks/useAuth.ts` | ✅ Refactorizado | Supabase Auth |
| `api/client.ts` | ✅ Actualizado | Interceptor tokens |
| `components/ProtectedRoute.tsx` | ✅ Creado | Protección rutas |
| `features/terms/TermsModal.tsx` | ✅ Creado | Modal términos |
| `features/auth/Login.tsx` | ✅ Refactorizado | Login Supabase |
| `App.tsx` | ✅ Actualizado | Validaciones completas |
| `.env` | ✅ Configurado | URLs Supabase + Backend |

---

## 🎯 Roles y Permisos

| Rol | Dashboard | Transacciones | Calculadora | Gestión Admin |
|-----|-----------|---------------|-------------|---------------|
| **admin** | ✅ | ✅ Ver todas | ✅ | ✅ |
| **full_user** | ✅ | ✅ Solo propias | ✅ | ❌ |
| **partial_user** | ✅ | ✅ Solo propias | ❌ | ❌ |

### Crear usuarios con roles

```sql
-- Crear admin
UPDATE profiles SET role = 'admin', is_active = true
WHERE email = 'admin@finanzasapp.com';

-- Crear full_user
UPDATE profiles SET role = 'full_user', is_active = true
WHERE email = 'user@finanzasapp.com';

-- Crear partial_user
UPDATE profiles SET role = 'partial_user', is_active = true
WHERE email = 'partial@finanzasapp.com';
```

---

## 🚀 Cómo Iniciar el Sistema

### 1. Backend
```bash
cd backend
source venv/bin/activate
cd ..
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend
```bash
cd frontend
npm run dev
```

### 3. Acceder
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/docs

---

## 🧪 Testing

### Probar Autenticación
1. Ir a http://localhost:5173
2. Login con usuario de Supabase
3. Verificar que aparece modal de términos (si es primer login)
4. Aceptar términos
5. Verificar redirección al dashboard

### Probar Roles
1. Login con `partial_user`
2. Verificar que no aparece opción "Calculadora" en sidebar
3. Login con `admin`
4. Verificar acceso completo

### Probar Backend
```bash
# Health check
curl http://localhost:8000/

# Obtener categorías (requiere token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/financial/categories
```

---

## 🐛 Problemas Conocidos y Soluciones

### Error: "infinite recursion detected in policy"
**Causa:** RLS con subqueries recursivas  
**Solución:** Ya resuelto con función RPC `accept_user_terms()` con SECURITY DEFINER

### Error: "Missing Supabase credentials"
**Causa:** Variables de entorno no cargadas  
**Solución:** Verificar que `.env` existe y está en el directorio correcto

### Usuario no puede actualizar términos
**Causa:** RLS bloqueando UPDATE  
**Solución:** Usar función RPC en lugar de UPDATE directo

---

## 📝 Próximos Pasos (Opcionales)

### Panel de Administración
- [ ] Endpoint `GET /api/admin/users`
- [ ] Endpoint `PUT /api/admin/users/{id}/toggle-active`
- [ ] Componente `AdminPanel.tsx`

### Gestión de Categorías
- [ ] Endpoints CRUD solo para admin
- [ ] Componente `CategoryManagement.tsx`

### Migración de Datos
- [ ] Script para exportar datos de SQLite
- [ ] Script para importar a Supabase
- [ ] Asignar `user_id` correcto

---

## 📊 Comparación Legacy vs Híbrido

| Aspecto | Legacy (SQLite) | Híbrido (Supabase) |
|---------|-----------------|-------------------|
| **Base de Datos** | SQLite local | PostgreSQL (Supabase) |
| **Autenticación** | JWT custom | Supabase Auth |
| **Seguridad** | Backend only | Backend + RLS |
| **Escalabilidad** | Limitada | Alta |
| **Backups** | Manual | Automático |
| **Multi-usuario** | Difícil | Nativo |
| **Realtime** | No | Sí (opcional) |
| **Hosting** | Requiere servidor | Serverless |

---

## 📞 Comandos Útiles

```bash
# Ver usuarios en Supabase
SELECT id, email, role, is_active, terms_accepted_at FROM profiles;

# Ver políticas RLS
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

# Ver triggers
SELECT trigger_name, event_object_table FROM information_schema.triggers;

# Promover usuario a admin
UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';

# Desactivar cuenta
UPDATE profiles SET is_active = false WHERE email = 'user@example.com';
```

---

**Estado Final:** ✅ **Migración 100% Completada**  
**Fecha:** Diciembre 2024  
**Versión:** 3.0.0
