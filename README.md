# 💰 FinanzasApp - Gestión Financiera Personal

Aplicación web full-stack para la gestión de finanzas personales con seguimiento de transacciones, calculadora de impuestos colombianos y análisis financiero en tiempo real.

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Arquitectura](#️-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Ejecución](#-ejecución)
- [API Endpoints](#-api-endpoints)
- [Roadmap de Migración](#-roadmap-de-migración)
- [Próximos Pasos](#-próximos-pasos)

---

## 📖 Descripción

**FinanzasApp** es una solución completa para la gestión de finanzas personales desarrollada con tecnologías modernas. Permite a los usuarios registrar ingresos y gastos, visualizar análisis financieros mediante gráficos interactivos, y calcular impuestos colombianos según el régimen tributario (Persona Natural o SAS).

El proyecto actualmente es un **monorepo** que contiene tanto el frontend (React + TypeScript) como el backend (FastAPI + Python), pero está **planificado para separarse en dos repositorios independientes** para facilitar el despliegue y escalabilidad.

---

## ✨ Características

### 🔐 Autenticación
- Sistema de autenticación basado en códigos de acceso
- Tokens JWT con expiración de 7 días
- Protección de rutas mediante middleware

### 💳 Gestión de Transacciones
- Registro de ingresos y gastos
- Categorización personalizada con iconos y colores
- Filtrado por mes, año, tipo y categoría
- Edición y eliminación de transacciones
- Notas adicionales para cada transacción

### 📊 Dashboard Interactivo
- Métricas principales (ingresos, gastos, balance)
- Gráfico circular de distribución de gastos (Recharts)
- Desglose detallado por categorías
- Filtros de mes y año
- Barras de progreso visuales

### 🧮 Calculadora de Impuestos
- Cálculo de impuesto de renta para Colombia (2025)
- Soporte para dos regímenes:
  - **Persona Natural** (tasas progresivas)
  - **SAS** (tasa fija del 35%)
- Cálculo de parafiscales (salud, pensión, ARL)
- Deducciones (AFC, intereses de vivienda)
- Visualización de tasa efectiva y renta neta

### 📈 Análisis Financiero
- Resúmenes mensuales automáticos
- Categorización de gastos e ingresos
- Identificación de categorías con mayor gasto
- Historial de transacciones

---

## 🏗️ Arquitectura

### Arquitectura Actual (Monorepo)
```
contapp/
├── frontend/          # Aplicación React + TypeScript
├── backend/           # API REST con FastAPI
└── finanzas.db        # Base de datos SQLite local
```

### Arquitectura Objetivo (Separación de Repositorios)

**Se planea migrar a una arquitectura de microservicios con dos repositorios independientes:**

#### 📦 Repositorio 1: Frontend
```
finanzas-frontend/
├── src/
│   ├── features/      # Módulos por funcionalidad
│   ├── components/    # Componentes reutilizables
│   ├── hooks/         # React hooks personalizados
│   ├── api/           # Cliente API y endpoints
│   ├── types/         # Definiciones TypeScript
│   └── utils/         # Utilidades y helpers
├── public/
└── package.json
```

**Despliegue:** Vercel / Netlify / AWS Amplify

#### 🔧 Repositorio 2: Backend
```
finanzas-backend/
├── app/
│   ├── routes/        # Endpoints de API
│   ├── models/        # Modelos de datos
│   ├── services/      # Lógica de negocio
│   ├── auth/          # Autenticación JWT
│   └── database/      # Conexión a base de datos
├── migrations/        # Migraciones de DB
└── requirements.txt
```

**Despliegue:** Railway / Render / AWS EC2 / Google Cloud Run

#### 🗄️ Base de Datos
- **Migración a Supabase** (PostgreSQL gestionado)
- **Autenticación:** Migración de JWT custom a Supabase Auth
- **Almacenamiento:** Supabase Storage para archivos futuros
- **Realtime:** Potencial para actualizaciones en tiempo real

---

## 🛠 Stack Tecnológico

### Frontend

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **React** | 19.2.0 | Biblioteca UI con hooks |
| **TypeScript** | 5.9.3 | Tipado estático |
| **Vite** | 7.2.4 | Build tool y dev server |
| **React Router** | 6.20.0 | Enrutamiento SPA |
| **Tailwind CSS** | 4.1.18 | Framework CSS utility-first |
| **React Query** | 5.90.12 | Gestión de estado del servidor |
| **React Hook Form** | 7.68.0 | Formularios con validación |
| **Zod** | 4.1.13 | Validación de esquemas |
| **Recharts** | 2.10.0 | Gráficos interactivos |
| **Axios** | 1.6.0 | Cliente HTTP |
| **Lucide React** | 0.561.0 | Iconos SVG |
| **date-fns** | 3.0.0 | Manipulación de fechas |

### Backend

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **FastAPI** | Latest | Framework web moderno y rápido |
| **Python** | 3.9+ | Lenguaje de programación |
| **SQLAlchemy** | Latest | ORM para bases de datos |
| **Pydantic** | Latest | Validación de datos |
| **python-jose** | Latest | JWT para autenticación |
| **passlib** | Latest | Hashing de contraseñas |
| **Uvicorn** | Latest | Servidor ASGI |

### Base de Datos

| Tecnología | Estado | Descripción |
|------------|--------|-------------|
| **SQLite** | 🟢 Actual | Base de datos local (desarrollo) |
| **Supabase** | 🟡 Planificado | PostgreSQL gestionado (producción) |

---

## 📁 Estructura del Proyecto

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts              # Cliente Axios con interceptores
│   │   └── endpoints.ts           # Definiciones de endpoints
│   ├── components/
│   │   ├── icons/                 # Iconos SVG personalizados
│   │   └── CategorySelect.tsx     # Selector de categorías
│   ├── features/
│   │   ├── auth/
│   │   │   └── components/
│   │   │       └── Login.tsx      # Pantalla de login
│   │   ├── dashboard/
│   │   │   └── components/
│   │   │       └── Dashboard.tsx  # Dashboard principal
│   │   ├── transactions/
│   │   │   └── components/
│   │   │       └── Transactions.tsx # CRUD de transacciones
│   │   └── tax-calculator/
│   │       └── components/
│   │           └── TaxCalculator.tsx # Calculadora de impuestos
│   ├── hooks/
│   │   ├── useAuth.ts             # Hook de autenticación
│   │   ├── useTransactions.ts     # Hooks de transacciones
│   │   └── useSummary.ts          # Hooks de resúmenes
│   ├── types/
│   │   └── index.ts               # Tipos TypeScript
│   ├── utils/
│   │   ├── currency.ts            # Formateo de moneda
│   │   └── constants.ts           # Constantes globales
│   ├── App.tsx                    # Componente raíz
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Estilos globales
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

### Backend (`/backend`)
```
backend/
├── __init__.py
├── main.py                 # Entry point de FastAPI
├── database.py             # Configuración de base de datos
├── models.py               # Modelos Pydantic (request/response)
├── auth.py                 # Autenticación JWT
├── financial_routes.py     # Endpoints financieros
├── analyze_excel.py        # Utilidad para análisis de Excel
├── import_excel_data.py    # Importación de datos desde Excel
├── save_excel_structure.py # Guardar estructura de Excel
└── test_excel.py           # Tests de importación Excel
```

### Base de Datos (`/finanzas.db`)
```
finanzas.db (SQLite)
├── users                   # Usuarios y códigos de acceso
├── categories              # Categorías de ingresos/gastos
├── transactions            # Transacciones financieras
├── budgets                 # Presupuestos por categoría
└── savings_goals           # Metas de ahorro
```

---

## 📦 Requisitos Previos

### Para desarrollo local:
- **Node.js** >= 18.0.0
- **npm** o **yarn**
- **Python** >= 3.9
- **pip**
- **SQLite** (incluido en Python)

### Para despliegue (futuro):
- Cuenta en **Supabase** (base de datos y autenticación)
- Cuenta en **Vercel/Netlify** (frontend)
- Cuenta en **Railway/Render** (backend)

---

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd contapp
```

### 2. Configurar Backend
```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En macOS/Linux:
source venv/bin/activate
# En Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Configurar Frontend
```bash
cd frontend

# Instalar dependencias
npm install
# o con yarn:
yarn install
```

---

## ⚙️ Configuración

### Backend

#### Variables de Entorno (crear `.env` en `/backend`)
```env
# Base de datos (actual)
DATABASE_URL=sqlite:///./finanzas.db

# Seguridad
SECRET_KEY=tu-clave-secreta-super-segura-cambiala-en-produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 días

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Supabase (futuro)
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your-anon-key
# SUPABASE_SERVICE_KEY=your-service-key
```

#### Código de Acceso por Defecto
- **Código:** `FINANZAS2026`
- **Usuario:** `Usuario`

### Frontend

#### Variables de Entorno (crear `.env` en `/frontend`)
```env
# API Backend
VITE_API_URL=http://localhost:8000

# Futuro: Supabase
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## ▶️ Ejecución

### Desarrollo Local

#### 1. Iniciar Backend
```bash
cd backend
source venv/bin/activate  # En Windows: venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en: `http://localhost:8000`

#### 2. Iniciar Frontend
```bash
cd frontend
npm run dev
# o con yarn:
yarn dev
```

El frontend estará disponible en: `http://localhost:5173`

### Producción

#### Backend
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

---

## 🔌 API Endpoints

### Autenticación
```
POST   /api/auth/login              # Login con código de acceso
```

### Transacciones
```
GET    /api/financial/transactions  # Listar transacciones (filtros: month, year, type, category_id)
POST   /api/financial/transactions  # Crear transacción
PUT    /api/financial/transactions/:id  # Actualizar transacción
DELETE /api/financial/transactions/:id  # Eliminar transacción
```

### Categorías
```
GET    /api/financial/categories    # Listar categorías (filtro: type)
```

### Resúmenes
```
GET    /api/financial/summary       # Resumen financiero (filtros: month, year)
GET    /api/financial/summary/monthly  # Resúmenes mensuales por año
```

### Presupuestos
```
GET    /api/financial/budgets       # Listar presupuestos (filtros: month, year)
POST   /api/financial/budgets       # Crear presupuesto
```

### Metas de Ahorro
```
GET    /api/financial/savings-goals # Listar metas de ahorro
POST   /api/financial/savings-goals # Crear meta de ahorro
PUT    /api/financial/savings-goals/:id  # Actualizar progreso
```

### Calculadora de Impuestos
```
POST   /api/calculate               # Calcular impuestos (no requiere autenticación)
```

### Documentación Interactiva
```
GET    /docs                        # Swagger UI
GET    /redoc                       # ReDoc
```

---

## 🚧 Roadmap de Migración

### Fase 1: Migración a Supabase ⏳
**Objetivo:** Migrar de SQLite a PostgreSQL con Supabase (manteniendo el monorepo)

**Razón:** Es más seguro migrar la base de datos primero mientras todo el código está en un solo lugar. Esto facilita el testing y debugging durante la migración.

#### Base de Datos
- [ ] Crear proyecto en Supabase
- [ ] Diseñar esquema de base de datos en PostgreSQL
- [ ] Crear migraciones con Alembic
- [ ] Migrar datos existentes de SQLite a Supabase
- [ ] Actualizar modelos de SQLAlchemy para PostgreSQL
- [ ] Configurar Row Level Security (RLS) en Supabase
- [ ] Probar todas las operaciones CRUD con Supabase

#### Autenticación
- [ ] Migrar de JWT custom a Supabase Auth
- [ ] Implementar login con email/password
- [ ] Configurar políticas de seguridad en Supabase
- [ ] Actualizar hooks del frontend para usar Supabase Auth
- [ ] Migrar usuarios existentes de SQLite a Supabase Auth
- [ ] Eliminar código de autenticación JWT custom (`auth.py`)

#### Backend
- [ ] Instalar `supabase-py` en el backend
- [ ] Actualizar `database.py` para conectar con Supabase
- [ ] Reemplazar `python-jose` por Supabase Auth
- [ ] Actualizar middleware de autenticación
- [ ] Probar todos los endpoints con nueva autenticación
- [ ] Actualizar documentación de API

#### Frontend
- [ ] Instalar `@supabase/supabase-js`
- [ ] Crear cliente de Supabase
- [ ] Actualizar `useAuth` hook para usar Supabase Auth
- [ ] Actualizar `api/client.ts` para incluir tokens de Supabase
- [ ] Actualizar llamadas a API si es necesario
- [ ] Implementar refresh de tokens automático
- [ ] Actualizar manejo de errores

#### Testing
- [ ] Probar login/logout
- [ ] Probar todas las funcionalidades del dashboard
- [ ] Probar CRUD de transacciones
- [ ] Probar calculadora de impuestos
- [ ] Verificar que no hay errores en consola
- [ ] Testing de performance

### Fase 2: Separación de Repositorios ⏳
**Objetivo:** Dividir el monorepo en dos repositorios independientes

**Razón:** Una vez que Supabase esté funcionando correctamente, podemos separar con confianza sabiendo que la base de datos es independiente.

#### Preparación
- [ ] Documentar todas las variables de entorno necesarias
- [ ] Crear diagrama de arquitectura final
- [ ] Planificar estrategia de versionado
- [ ] Configurar repositorios en GitHub

#### Frontend
- [ ] Crear repositorio `finanzas-frontend` en GitHub
- [ ] Migrar código del frontend al nuevo repo
- [ ] Configurar variables de entorno para Supabase
- [ ] Actualizar URLs de API para apuntar al backend desplegado
- [ ] Configurar CI/CD para despliegue en Vercel/Netlify
- [ ] Realizar primer despliegue en staging
- [ ] Configurar dominio personalizado
- [ ] Testing en producción

#### Backend
- [ ] Crear repositorio `finanzas-backend` en GitHub
- [ ] Migrar código del backend al nuevo repo
- [ ] Configurar variables de entorno de producción (Supabase)
- [ ] Configurar CORS para el dominio del frontend
- [ ] Configurar CI/CD para despliegue en Railway/Render
- [ ] Realizar primer despliegue en staging
- [ ] Configurar logging y monitoring
- [ ] Testing de endpoints en producción

#### Integración
- [ ] Conectar frontend desplegado con backend desplegado
- [ ] Verificar que todas las funcionalidades funcionan
- [ ] Configurar SSL/HTTPS en ambos servicios
- [ ] Optimizar configuración de CORS
- [ ] Testing end-to-end

### Fase 3: Optimizaciones y Nuevas Funcionalidades 🔮
- [ ] Implementar modo offline (PWA)
- [ ] Agregar notificaciones push
- [ ] Exportar reportes en PDF/Excel
- [ ] Gráficos adicionales (tendencias, proyecciones)
- [ ] Configuración de presupuestos automáticos
- [ ] Recordatorios de pagos recurrentes
- [ ] Soporte multi-usuario (compartir finanzas)
- [ ] Dashboard móvil optimizado

---

## 🎯 Próximos Pasos

### Inmediato (Sprint Actual) - Fase 1: Supabase
1. **Configurar Supabase** - Crear proyecto y diseñar esquema de base de datos
2. **Migrar base de datos** - Crear migraciones de SQLite a PostgreSQL
3. **Migrar autenticación** - Implementar Supabase Auth (backend y frontend)
4. **Testing completo** - Verificar que todo funciona con Supabase en el monorepo

### Corto Plazo (2-3 semanas) - Fase 2: Separación
1. **Preparar repositorios** - Crear `finanzas-frontend` y `finanzas-backend`
2. **Migrar código** - Separar frontend y backend en repos independientes
3. **Desplegar backend** - Railway/Render con Supabase
4. **Desplegar frontend** - Vercel/Netlify apuntando al backend desplegado
5. **Configurar dominios** - SSL y configuración de CORS

### Mediano Plazo (1-2 meses) - Fase 3: Optimizaciones
1. Agregar tests unitarios y de integración
2. Implementar PWA para uso offline
3. Optimizar rendimiento y carga
4. Agregar funcionalidades avanzadas (exportar reportes, etc.)
5. Documentación completa de usuario
6. Configurar monitoring y logging

---

## 📝 Notas Importantes

### Migración de Base de Datos
- **SQLite actual:** Base de datos local para desarrollo
- **Supabase futuro:** PostgreSQL gestionado con autenticación integrada
- **Ventajas de Supabase:**
  - Autenticación out-of-the-box
  - Realtime subscriptions
  - Storage para archivos
  - Row Level Security (RLS)
  - Backups automáticos
  - Escalabilidad

### Separación de Repositorios
- **Ventajas:**
  - Despliegue independiente
  - Escalabilidad horizontal
  - CI/CD específico por servicio
  - Versionado independiente
  - Equipos pueden trabajar en paralelo
  - Menor acoplamiento

---

## 🤝 Contribuciones

Este es un proyecto en desarrollo activo. Las contribuciones son bienvenidas.

---

## 📄 Licencia

Este proyecto es de uso privado.

---

## 📞 Contacto

Para más información sobre el proyecto, consulta la documentación técnica en `MIGRATION_STATUS.md`.

---

**Última actualización:** Diciembre 2024
**Estado:** En desarrollo - Migración a arquitectura de microservicios planificada
