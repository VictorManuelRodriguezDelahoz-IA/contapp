# 💰 FinanzasApp - Gestión Financiera Personal

Aplicación web full-stack para gestión de finanzas personales con arquitectura híbrida: Supabase + FastAPI + React.

---

## 🚀 Quick Start

### 1. Clonar el proyecto
```bash
git clone <repository-url>
cd contapp
```

### 2. Iniciar Backend
```bash
cd backend
source venv/bin/activate  # En Windows: venv\Scripts\activate
cd ..
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend disponible en:** http://localhost:8000/docs

### 3. Iniciar Frontend
```bash
cd frontend
npm install  # Solo primera vez
npm run dev
```

**Frontend disponible en:** http://localhost:5173

---

## 📋 Características

### 💳 Gestión Financiera
- ✅ Registro de ingresos y gastos
- ✅ Categorización con iconos y colores
- ✅ Filtros por mes, año, tipo y categoría
- ✅ Dashboard interactivo con gráficos
- ✅ Presupuestos mensuales
- ✅ Metas de ahorro

### 🧮 Calculadora de Impuestos
- ✅ Impuesto de renta Colombia 2025
- ✅ Dos regímenes: Persona Natural y SAS
- ✅ Cálculo de parafiscales (salud, pensión, ARL)
- ✅ Deducciones (AFC, intereses hipotecarios)

### 🔐 Autenticación y Roles
- ✅ Login con email/password (Supabase Auth)
- ✅ 3 roles: Admin, Full User, Partial User
- ✅ Modal de términos y condiciones (bloqueante)
- ✅ Validación de cuenta activa
- ✅ RLS (Row Level Security) en Supabase

---

## 🏗️ Arquitectura

```
┌────────────────────────────────────────────────┐
│         Frontend (React + Vite + TypeScript)    │
│  - UI/UX                                       │
│  - Login con Supabase Auth                     │
│  - Comunicación con Backend vía API            │
└────────────────────────────────────────────────┘
                      ↓ Bearer Token
┌────────────────────────────────────────────────┐
│         Backend (FastAPI + Python)              │
│  - Validación de tokens JWT                    │
│  - Lógica de negocio                           │
│  - Agregaciones y cálculos complejos           │
│  - CRUD de transacciones, presupuestos, etc.   │
└────────────────────────────────────────────────┘
                      ↓ Queries SQL
┌────────────────────────────────────────────────┐
│      Supabase (PostgreSQL + Auth + RLS)         │
│  - Base de datos relacional                    │
│  - Generación de JWT tokens                    │
│  - Row Level Security                          │
└────────────────────────────────────────────────┘
```

### ¿Por qué esta arquitectura?

- **Separación de responsabilidades**: Cada capa tiene su función específica
- **Seguridad multicapa**: JWT + RLS + Validación de permisos
- **Escalabilidad**: Componentes independientes
- **Performance**: Agregaciones en backend, menos tráfico de red
- **Flexibilidad**: Fácil agregar features o cambiar componentes

---

## 🛠 Stack Tecnológico

### Frontend
- **React** 19.2.0 - UI Library
- **TypeScript** 5.9.3 - Tipado estático
- **Vite** 7.2.4 - Build tool
- **TailwindCSS** 4.1.18 - Estilos
- **React Query** 5.90.12 - Estado del servidor
- **Supabase JS** - Cliente de Supabase
- **Recharts** 2.10.0 - Gráficos

### Backend
- **FastAPI** 0.110.0 - Framework web
- **Python** 3.9+ - Lenguaje
- **Uvicorn** 0.27.1 - Servidor ASGI
- **Pydantic** 2.6.1 - Validación de datos
- **Supabase Python** 2.4.0 - Cliente de Supabase

### Base de Datos
- **Supabase** - PostgreSQL gestionado
- **Row Level Security** - Seguridad a nivel de fila
- **5 tablas**: profiles, categories, transactions, budgets, savings_goals

---

## 📁 Estructura del Proyecto

```
contapp/
├── backend/                    # Backend FastAPI
│   ├── main.py                # Entry point + Calculadora
│   ├── database.py            # Cliente Supabase
│   ├── auth.py                # Validación JWT
│   ├── financial_routes.py   # Endpoints CRUD
│   ├── models.py              # Modelos Pydantic
│   ├── requirements.txt       # Dependencias Python
│   ├── .env                   # Variables de entorno
│   ├── venv/                  # Entorno virtual Python
│   └── README.md              # Documentación backend
│
├── frontend/                   # Frontend React
│   ├── src/
│   │   ├── features/          # Features (auth, dashboard, etc.)
│   │   ├── components/        # Componentes reutilizables
│   │   ├── hooks/             # Hooks personalizados
│   │   ├── lib/               # Librerías (supabaseClient)
│   │   └── api/               # Cliente API
│   ├── .env                   # Variables de entorno
│   ├── package.json           # Dependencias Node
│   └── README.md              # Documentación frontend
│
├── README.md                   # Este archivo
└── MIGRATION_GUIDE.md         # Guía de migración a Supabase
```

---

## 🔧 Configuración

### Variables de Entorno

#### Backend (`backend/.env`)
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_API_URL=http://localhost:8000
```

> **Nota:** Los archivos `.env` ya están configurados con credenciales de Supabase.

---

## 📚 API Endpoints

### Públicos (sin autenticación)
- `GET /` - Health check
- `POST /api/calculate` - Calculadora de impuestos

### Protegidos (requieren Bearer token)
- `GET /api/financial/categories` - Listar categorías
- `GET /api/financial/transactions` - Listar transacciones
- `POST /api/financial/transactions` - Crear transacción
- `PUT /api/financial/transactions/{id}` - Actualizar transacción
- `DELETE /api/financial/transactions/{id}` - Eliminar transacción
- `GET /api/financial/summary` - Resumen financiero
- `GET /api/financial/summary/monthly` - Resúmenes mensuales
- `POST /api/financial/budgets` - Crear presupuesto
- `GET /api/financial/budgets` - Listar presupuestos
- `POST /api/financial/savings-goals` - Crear meta de ahorro
- `GET /api/financial/savings-goals` - Listar metas de ahorro
- `PUT /api/financial/savings-goals/{id}` - Actualizar meta

**Documentación interactiva:** http://localhost:8000/docs

---

## 🔒 Roles y Permisos

| Rol | Acceso Dashboard | Transacciones | Calculadora | Gestión Admin |
|-----|------------------|---------------|-------------|---------------|
| **admin** | ✅ | ✅ Ver todas | ✅ | ✅ |
| **full_user** | ✅ | ✅ Solo propias | ✅ | ❌ |
| **partial_user** | ✅ | ✅ Solo propias | ❌ | ❌ |

---

## 🧪 Testing

### Probar Backend
```bash
# Health check
curl http://localhost:8000/

# Calculadora (público)
curl -X POST http://localhost:8000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"legal_status":"natural","monthly_income":5000000,"monthly_expenses":3000000,"afc_contributions":0,"mortgage_interest":0,"patrimony":0}'
```

### Probar con Autenticación
1. Login en frontend: http://localhost:5173
2. Obtener token de Supabase desde DevTools
3. Usar token en requests:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/financial/categories
```

---

## 📖 Documentación Adicional

- [Backend README](backend/README.md) - Documentación completa del backend
- [Frontend README](frontend/README.md) - Documentación completa del frontend
- [Migration Guide](MIGRATION_GUIDE.md) - Guía de migración a Supabase

---

## 🐛 Troubleshooting

### Backend no inicia
```bash
# Verificar entorno virtual
source backend/venv/bin/activate

# Reinstalar dependencias
cd backend
pip install -r requirements.txt

# Verificar .env
cat backend/.env
```

### Frontend no conecta
```bash
# Verificar variables de entorno
cat frontend/.env

# Limpiar cache y reinstalar
cd frontend
rm -rf node_modules .vite
npm install
npm run dev
```

### Error 401 Unauthorized
- Verificar que el usuario existe en Supabase
- Verificar que el usuario aceptó términos (`terms_accepted_at` no NULL)
- Verificar que la cuenta está activa (`is_active = true`)

---

## 🎯 Próximos Pasos

- [ ] Panel de administración (gestión de usuarios)
- [ ] Gestión de categorías por admin
- [ ] Exportar reportes en PDF/Excel
- [ ] Notificaciones de presupuesto excedido
- [ ] Gráficos de tendencias y proyecciones
- [ ] PWA para uso offline
- [ ] Recordatorios de pagos recurrentes

---

## 📄 Licencia

Este proyecto es de uso privado.

---

## 📞 Comandos Rápidos

```bash
# Iniciar backend
cd backend && source venv/bin/activate && cd .. && uvicorn backend.main:app --reload

# Iniciar frontend
cd frontend && npm run dev

# Ver logs del backend
# (los logs aparecen en la terminal donde corriste uvicorn)

# Ver documentación API
open http://localhost:8000/docs
```

---

**Última actualización:** Diciembre 2024  
**Versión:** 3.0.0 (Arquitectura Híbrida con Supabase)  
**Estado:** ✅ Funcional y listo para desarrollo
