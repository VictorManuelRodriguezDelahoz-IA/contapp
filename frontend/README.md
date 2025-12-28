# ⚛️ Frontend - FinanzasApp

Frontend React con TypeScript, Vite, TailwindCSS y Supabase Auth.

---

## 🚀 Quick Start

```bash
# Instalar dependencias (solo primera vez)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

**Aplicación disponible en:** http://localhost:5173

---

## 🏗️ Arquitectura

```
React Components
    ↓
Hooks (useAuth, useTransactions, etc.)
    ↓
API Client (axios + Supabase)
    ↓
Backend API (http://localhost:8000)
    ↓
Supabase (Auth + Database)
```

---

## 📁 Estructura de Archivos

```
frontend/
├── src/
│   ├── features/              # Features organizadas por módulo
│   │   ├── auth/             # Login, términos
│   │   ├── dashboard/        # Dashboard principal
│   │   ├── transactions/     # CRUD de transacciones
│   │   ├── tax-calculator/   # Calculadora de impuestos
│   │   ├── terms/            # Modal de términos
│   │   └── admin/            # Panel de administración ⭐ NUEVO
│   │
│   ├── components/            # Componentes reutilizables
│   │   ├── icons/            # Iconos SVG
│   │   ├── ProtectedRoute.tsx
│   │   └── CategorySelect.tsx
│   │
│   ├── hooks/                 # Hooks personalizados
│   │   ├── useAuth.ts        # Autenticación
│   │   ├── useTransactions.ts
│   │   ├── useSummary.ts
│   │   └── useAdminUsers.ts  # Gestión de usuarios ⭐ NUEVO
│   │
│   ├── lib/                   # Librerías
│   │   └── supabaseClient.ts # Cliente de Supabase
│   │
│   ├── api/                   # API Client
│   │   ├── client.ts         # Axios con interceptors
│   │   └── endpoints.ts      # Definición de endpoints
│   │
│   ├── types/                 # Tipos TypeScript
│   │   └── index.ts
│   │
│   ├── utils/                 # Utilidades
│   │   ├── currency.ts       # Formateo de moneda
│   │   └── constants.ts      # Constantes
│   │
│   ├── App.tsx               # Componente raíz
│   ├── main.tsx              # Entry point
│   └── index.css             # Estilos globales
│
├── public/                    # Archivos estáticos
├── .env                       # Variables de entorno
├── package.json              # Dependencias
├── vite.config.ts            # Configuración Vite
├── tailwind.config.js        # Configuración Tailwind
└── README.md                 # Este archivo
```

---

## ⚙️ Configuración

### Variables de Entorno (`.env`)

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Backend API
VITE_API_URL=http://localhost:8000
```

> **Nota:** Las variables con prefijo `VITE_` son expuestas al cliente.

---

## 🔐 Autenticación

### Flujo de Login

1. **Usuario ingresa email/password en [Login.tsx](src/features/auth/components/Login.tsx)**

2. **Hook [useAuth.ts](src/hooks/useAuth.ts) llama a Supabase:**
   ```typescript
   const { data } = await supabase.auth.signInWithPassword({email, password})
   ```

3. **Supabase retorna JWT token:**
   ```typescript
   const token = data.session.access_token
   ```

4. **Si es primer login → Modal de Términos:**
   - Componente: [TermsModal.tsx](src/features/terms/components/TermsModal.tsx)
   - Bloqueante (no se puede cerrar)
   - Llama a RPC `accept_user_terms()`

5. **Frontend guarda token y usuario en estado**

6. **Todas las peticiones al backend incluyen el token:**
   ```typescript
   axios.get('/api/financial/transactions', {
     headers: { 'Authorization': `Bearer ${token}` }
   })
   ```

### Protección de Rutas

Componente: [ProtectedRoute.tsx](src/components/ProtectedRoute.tsx)

```typescript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

<ProtectedRoute requireFullAccess>
  <TaxCalculator />  {/* Bloqueada para partial_user */}
</ProtectedRoute>

<ProtectedRoute requireAdmin>
  <AdminPanel />  {/* Solo para admin */}
</ProtectedRoute>
```

---

## 🎨 Componentes Principales

### [App.tsx](src/App.tsx)
- Componente raíz
- Maneja routing
- Muestra sidebar y navegación
- Oculta calculadora para `partial_user`
- Muestra administración solo para `admin`

### [Dashboard.tsx](src/features/dashboard/components/Dashboard.tsx)
- Muestra resumen financiero
- Gráfico circular de gastos
- Filtros de mes/año
- Desglose por categorías

### [Transactions.tsx](src/features/transactions/components/Transactions.tsx)
- CRUD completo de transacciones
- Filtros por categoría y tipo
- Modal para crear/editar
- Listado con paginación

### [TaxCalculator.tsx](src/features/tax-calculator/components/TaxCalculator.tsx)
- Calculadora de impuestos
- Sin autenticación requerida
- Dos regímenes: Persona Natural y SAS
- Cálculo en tiempo real

### [AdminPanel.tsx](src/features/admin/components/AdminPanel.tsx) - **NUEVO**
- 👨‍💼 Panel de administración (solo para admins)
- Gestión completa de usuarios del sistema
- Ver estadísticas globales
- Activar/desactivar cuentas
- Cambiar roles de usuarios
- Eliminar usuarios y sus datos

---

## 🎣 Hooks Personalizados

### [useAuth.ts](src/hooks/useAuth.ts)
```typescript
const { user, profile, isAuthenticated, login, logout, acceptTerms } = useAuth()
```

**Funciones:**
- `login(email, password)` - Iniciar sesión
- `logout()` - Cerrar sesión
- `acceptTerms()` - Aceptar términos (RPC)

**Estados:**
- `user` - Usuario de Supabase
- `profile` - Perfil con role, is_active, etc.
- `isAuthenticated` - Boolean
- `isAdmin` - Boolean
- `loading` - Boolean

### [useTransactions.ts](src/hooks/useTransactions.ts)
```typescript
const { transactions, isLoading, createTransaction, updateTransaction, deleteTransaction } = useTransactions(filters)
```

### [useSummary.ts](src/hooks/useSummary.ts)
```typescript
const { summary, isLoading } = useSummary({ month, year })
```

### [useAdminUsers.ts](src/hooks/useAdminUsers.ts) - **NUEVO**
```typescript
const {
  users,
  statistics,
  createUser,
  updateUser,
  toggleUserActive,
  deleteUser,
  isCreating,
  isUpdating,
  isLoading
} = useAdminUsers()
```

**Funciones:**
- `createUser({ email, password, full_name, role })` - Crear nuevo usuario con contraseña temporal
- `updateUser({ userId, data })` - Actualizar usuario (rol, nombre, etc.)
- `toggleUserActive(userId)` - Activar/desactivar cuenta
- `deleteUser(userId)` - Eliminar usuario y todos sus datos asociados

**Estados:**
- `users` - Array de todos los usuarios del sistema con estadísticas
- `statistics` - Estadísticas globales (totales, activos, por rol, transacciones, categorías)
- `isCreating`, `isUpdating`, `isLoading` - Estados de carga por operación

---

## 🛠 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linter
npm run lint

# TypeScript check
npm run type-check
```

---

## 📦 Dependencias Principales

```json
{
  "react": "19.2.0",
  "typescript": "5.9.3",
  "vite": "7.2.4",
  "@supabase/supabase-js": "^2.0.0",
  "@tanstack/react-query": "5.90.12",
  "axios": "^1.6.0",
  "react-router-dom": "6.20.0",
  "tailwindcss": "4.1.18",
  "recharts": "2.10.0",
  "react-hook-form": "7.68.0",
  "zod": "4.1.13",
  "date-fns": "3.0.0"
}
```

---

## 🧪 Testing

### Pruebas Manuales

1. **Login:**
   - Ir a http://localhost:5173
   - Ingresar email/password de Supabase
   - Verificar que redirige al dashboard

2. **Modal de Términos:**
   - Crear usuario nuevo en Supabase
   - Login con ese usuario
   - Verificar que aparece modal bloqueante

3. **Transacciones:**
   - Crear una transacción
   - Verificar que aparece en el listado
   - Editar y eliminar

4. **Dashboard:**
   - Verificar que los resúmenes son correctos
   - Cambiar filtros de mes/año
   - Verificar gráfico circular

5. **Calculadora:**
   - Ingresar datos
   - Verificar cálculos
   - Probar ambos regímenes

6. **Panel de Administración (solo admin):**
   - Login como admin
   - Ir a http://localhost:5173/admin
   - Ver estadísticas del sistema
   - Editar rol de un usuario
   - Activar/desactivar cuenta
   - Buscar y filtrar usuarios

---

## 🎨 Sistema de Diseño

### Filosofía
Diseño minimalista inspirado en Apple: interfaces limpias, jerarquía visual clara, transiciones suaves y consistencia en toda la aplicación.

### Paleta de Colores

**Colores Principales:**
- **Primary**: `#AA73F3` (Púrpura) - Acciones principales, botones CTA
- **Secondary**: `#FFFFFE` (Blanco) - Fondos de tarjetas
- **Tertiary**: `#1C145D` (Azul oscuro) - Textos importantes, contraste fuerte

**Colores de Estado:**
- **Success**: `#30D158` (Verde) - Éxito, ingresos
- **Warning**: `#FF9F0A` (Naranja) - Advertencias
- **Error**: `#FF3B30` (Rojo) - Errores, gastos
- **Info**: `#007AFF` (Azul) - Información

**Colores de UI:**
```css
/* Backgrounds */
bg-surface: #F5F5F7      /* Fondo principal */
bg-background-card: #FFF /* Tarjetas */

/* Text */
text-primary: #1D1D1F    /* Texto principal */
text-secondary: #86868B  /* Texto secundario */
text-tertiary: #C6C6C8   /* Texto deshabilitado */

/* Borders */
border-light: #E5E5EA    /* Bordes sutiles */
border-default: #D2D2D7  /* Bordes estándar */
```

### Componentes Pre-construidos

**Botones:**
```tsx
<button className="btn-primary">Acción Principal</button>
<button className="btn-secondary">Acción Secundaria</button>
<button className="btn-ghost">Acción Terciaria</button>
```

**Cards:**
```tsx
<div className="card">Tarjeta estándar</div>
<div className="card-hover">Tarjeta con hover</div>
```

**Inputs:**
```tsx
<input className="input" placeholder="Texto..." />
```

**Badges:**
```tsx
<span className="badge-primary">Pro</span>
<span className="badge-success">Activo</span>
<span className="badge-warning">Pendiente</span>
<span className="badge-error">Error</span>
```

### Tipografía
```css
Font: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI'
```

| Clase | Uso |
|-------|-----|
| `text-xs` | Notas, metadatos |
| `text-sm` | Texto secundario, labels |
| `text-base` | Texto principal |
| `text-lg` - `text-4xl` | Encabezados (gradual) |

### Animaciones

```tsx
<div className="animate-fade-in">Aparece suavemente</div>
<div className="animate-slide-up">Desliza desde abajo</div>
<div className="animate-scale-in">Escala desde 95% a 100%</div>
```

### Espaciado
Sistema basado en grid de **8px**: `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px)

### Border Radius
- `rounded-lg` (12px) - Cards, inputs
- `rounded-xl` (16px) - Modales, containers
- `rounded-2xl` (20px) - Elementos grandes

### Utilidades Personalizadas

```tsx
/* Gradient text */
<h1 className="gradient-text">FinanzasApp</h1>

/* Glass effect */
<div className="glass">Efecto glassmorphism</div>

/* Smooth transitions */
<div className="transition-smooth hover:scale-105">Hover suave</div>
```

### Configuración
- **Tailwind Config**: [tailwind.config.js](tailwind.config.js)
- **CSS Global**: [src/index.css](src/index.css)
- Ver archivos para paleta completa y variables CSS personalizadas

---

## 🐛 Troubleshooting

### Error: "Supabase client not initialized"
**Solución:**
```bash
# Verificar .env
cat .env

# Reiniciar dev server
npm run dev
```

### Error: "Network Error" al llamar API
**Solución:**
```bash
# Verificar que el backend está corriendo
curl http://localhost:8000/

# Verificar VITE_API_URL en .env
echo $VITE_API_URL
```

### Modal de términos no aparece
**Solución:**
- Verificar que el usuario tiene `terms_accepted_at = NULL` en Supabase
- Verificar que la función RPC `accept_user_terms()` existe

### Calculadora bloqueada para partial_user
**Solución:**
- Esto es el comportamiento esperado
- Cambiar role en Supabase: `UPDATE profiles SET role = 'full_user' WHERE email = '...'`

### Panel de administración no aparece
**Solución:**
- Solo visible para usuarios con `role = 'admin'`
- Verificar rol en Supabase: `SELECT role FROM profiles WHERE email = '...'`
- Cambiar a admin: `UPDATE profiles SET role = 'admin' WHERE email = '...'`

---

## 👨‍💼 Panel de Administración

### Características

El Panel de Administración es una sección exclusiva para usuarios con rol `admin` que permite gestionar todos los usuarios del sistema.

**URL:** `/admin` (http://localhost:5173/admin)

### Funcionalidades

#### 📊 Dashboard de Estadísticas
- **Total Usuarios**: Cantidad total de usuarios registrados
- **Usuarios Activos**: Usuarios con cuenta activa
- **Transacciones**: Total de transacciones en el sistema
- **Categorías**: Total de categorías disponibles

#### 🔍 Búsqueda y Filtros
- **Búsqueda**: Por email o nombre completo (tiempo real)
- **Filtro por Rol**: Admin, Usuario Pro, Usuario Básico
- **Filtro por Estado**: Todos, Activos, Inactivos

#### 👥 Gestión de Usuarios

**Tabla con columnas:**
- Usuario (nombre y email)
- Rol (con badge de color)
- Estado (activo/inactivo)
- Cantidad de transacciones
- Estado de términos aceptados
- Acciones disponibles

**Acciones:**

1. **✏️ Editar Usuario**
   - Cambiar rol (admin, full_user, partial_user)
   - Editar nombre completo
   - Guardado inmediato

2. **🔄 Activar/Desactivar**
   - Toggle para cambiar estado de cuenta
   - Usuarios desactivados no pueden acceder
   - Protección: no puedes desactivar tu propia cuenta

3. **🗑️ Eliminar Usuario**
   - Elimina usuario y TODOS sus datos
   - Incluye: transacciones, presupuestos, metas de ahorro
   - ⚠️ Acción irreversible (requiere confirmación)
   - Protección: no puedes eliminar tu propia cuenta

### API Endpoints Utilizados

```typescript
// Listar usuarios
GET /api/admin/users

// Ver detalles de usuario
GET /api/admin/users/:id

// Actualizar usuario
PUT /api/admin/users/:id

// Toggle activo/inactivo
PUT /api/admin/users/:id/toggle-active

// Eliminar usuario
DELETE /api/admin/users/:id

// Estadísticas del sistema
GET /api/admin/statistics
```

### Seguridad

- ✅ Solo accesible para usuarios con `role = 'admin'`
- ✅ Validación en frontend y backend
- ✅ Protección contra auto-desactivación/eliminación
- ✅ Confirmación para acciones destructivas
- ✅ RLS en Supabase respeta permisos de admin

---

## 🔧 Desarrollo

### Agregar nueva feature

1. **Crear carpeta en `src/features/`:**
   ```
   features/
   └── my-feature/
       └── components/
           └── MyFeature.tsx
   ```

2. **Crear hook si es necesario:**
   ```typescript
   // hooks/useMyFeature.ts
   export const useMyFeature = () => {
     const { data } = useQuery({
       queryKey: ['my-feature'],
       queryFn: () => axios.get('/api/my-feature')
     })
     return { data }
   }
   ```

3. **Agregar ruta en [App.tsx](src/App.tsx):**
   ```tsx
   <Route path="/my-feature" element={
     <ProtectedRoute>
       <MyFeature />
     </ProtectedRoute>
   } />
   ```

---

## 📚 Recursos

- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/)
- [Supabase JS Docs](https://supabase.com/docs/reference/javascript/introduction)
- [React Query Docs](https://tanstack.com/query/latest)

---

**Versión:** 3.0.0  
**Última actualización:** Diciembre 2024  
**Estado:** ✅ Funcional
