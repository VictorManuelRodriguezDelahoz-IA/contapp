# 📚 Índice de Documentación - FinanzasApp

Guía rápida para navegar por toda la documentación del proyecto.

---

## 🎯 Por Donde Empezar

### 🆕 Nuevo en el proyecto
1. Lee el [README.md](README.md) principal
2. Sigue la sección "Quick Start"
3. Explora la arquitectura híbrida

### 🔄 Entender la migración
1. Lee [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
2. Revisa el esquema de base de datos
3. Comprende el flujo de autenticación

### 👨‍💻 Desarrollar en Backend
1. Lee [backend/README.md](backend/README.md)
2. Configura el entorno virtual
3. Explora los endpoints en `/docs`

### 🎨 Desarrollar en Frontend
1. Lee [frontend/README.md](frontend/README.md)
2. Revisa la estructura de componentes
3. Familiarízate con los hooks

---

## 📖 Documentos Disponibles

### [README.md](README.md) - Documentación Principal
**Tamaño:** ~9.5 KB | **Audiencia:** Todos

**Contenido:**
- ✅ Quick Start (backend + frontend)
- ✅ Características del proyecto
- ✅ Arquitectura híbrida explicada
- ✅ Stack tecnológico completo
- ✅ Estructura del proyecto
- ✅ Variables de entorno
- ✅ API Endpoints de alto nivel
- ✅ Roles y permisos
- ✅ Testing básico
- ✅ Troubleshooting general
- ✅ Próximos pasos

**Cuándo leer:**
- Primera vez usando el proyecto
- Necesitas overview general
- Quieres iniciar todo el sistema

---

### [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Guía de Migración
**Tamaño:** ~9.7 KB | **Audiencia:** Desarrolladores

**Contenido:**
- ✅ Resumen de la migración (Legacy → Híbrido)
- ✅ Lo que se completó (100%)
- ✅ Esquema completo de base de datos
- ✅ Row Level Security (RLS) explicado
- ✅ Flujo de autenticación detallado
- ✅ Archivos modificados
- ✅ Roles y permisos por tabla
- ✅ Comandos SQL útiles
- ✅ Comparación antes vs después

**Cuándo leer:**
- Necesitas entender la arquitectura
- Quieres conocer la historia del proyecto
- Necesitas trabajar con la base de datos
- Quieres implementar nuevas features

---

### [backend/README.md](backend/README.md) - Documentación Backend
**Tamaño:** ~7.5 KB | **Audiencia:** Desarrolladores Backend

**Contenido:**
- ✅ Quick Start del backend
- ✅ Instalación paso a paso
- ✅ Arquitectura del backend
- ✅ Estructura de archivos explicada
- ✅ API Endpoints con ejemplos
- ✅ Autenticación y middleware
- ✅ Variables de entorno
- ✅ Testing con curl
- ✅ Troubleshooting específico
- ✅ Cómo agregar nuevos endpoints

**Cuándo leer:**
- Vas a trabajar en el backend
- Necesitas agregar nuevos endpoints
- Quieres entender la validación de tokens
- Necesitas hacer debugging del backend

---

### [frontend/README.md](frontend/README.md) - Documentación Frontend
**Tamaño:** ~8.8 KB | **Audiencia:** Desarrolladores Frontend

**Contenido:**
- ✅ Quick Start del frontend
- ✅ Instalación de dependencias
- ✅ Arquitectura del frontend
- ✅ Estructura de carpetas
- ✅ Variables de entorno
- ✅ Flujo de autenticación visual
- ✅ Componentes principales
- ✅ Hooks personalizados (useAuth, useTransactions)
- ✅ Scripts disponibles
- ✅ Estilos con TailwindCSS
- ✅ Testing manual
- ✅ Troubleshooting específico
- ✅ Cómo agregar nuevas features

**Cuándo leer:**
- Vas a trabajar en el frontend
- Necesitas crear nuevos componentes
- Quieres entender el flujo de login
- Necesitas hacer debugging del frontend

---

## 🗺️ Mapa de Navegación

```
¿Qué necesitas hacer?
│
├─ Iniciar el proyecto completo
│  └─ Lee: README.md → Sección "Quick Start"
│
├─ Entender cómo funciona todo
│  └─ Lee: README.md → Sección "Arquitectura"
│       └─ MIGRATION_GUIDE.md → Sección "Flujo de Autenticación"
│
├─ Trabajar en el backend
│  └─ Lee: backend/README.md → Todo
│       └─ Documentación API en: http://localhost:8000/docs
│
├─ Trabajar en el frontend
│  └─ Lee: frontend/README.md → Todo
│       └─ Explora: src/features/
│
├─ Entender la base de datos
│  └─ Lee: MIGRATION_GUIDE.md → Sección "Esquema de Base de Datos"
│       └─ Revisa: MIGRATION_GUIDE.md → Sección "RLS"
│
├─ Resolver un problema
│  └─ Lee: README.md → Sección "Troubleshooting"
│       ├─ Si es backend → backend/README.md → Troubleshooting
│       └─ Si es frontend → frontend/README.md → Troubleshooting
│
└─ Agregar nueva feature
   ├─ Backend → backend/README.md → Sección "Desarrollo"
   └─ Frontend → frontend/README.md → Sección "Desarrollo"
```

---

## 🔍 Búsqueda Rápida

### ¿Cómo inicio el backend?
→ [backend/README.md](backend/README.md#-quick-start)

### ¿Cómo inicio el frontend?
→ [frontend/README.md](frontend/README.md#-quick-start)

### ¿Qué endpoints hay disponibles?
→ [README.md - API Endpoints](README.md#-api-endpoints)  
→ [backend/README.md - Endpoints detallados](backend/README.md#-api-endpoints)

### ¿Cómo funciona la autenticación?
→ [MIGRATION_GUIDE.md - Flujo de Autenticación](MIGRATION_GUIDE.md#-flujo-de-autenticación)  
→ [backend/README.md - Autenticación](backend/README.md#-autenticación)  
→ [frontend/README.md - Autenticación](frontend/README.md#-autenticación)

### ¿Qué roles existen?
→ [README.md - Roles y Permisos](README.md#-roles-y-permisos)  
→ [MIGRATION_GUIDE.md - Roles y Permisos](MIGRATION_GUIDE.md#-roles-y-permisos)

### ¿Cómo es la base de datos?
→ [MIGRATION_GUIDE.md - Esquema de Base de Datos](MIGRATION_GUIDE.md#️-esquema-de-base-de-datos)

### ¿Cómo agrego un nuevo endpoint?
→ [backend/README.md - Desarrollo](backend/README.md#-desarrollo)

### ¿Cómo agrego un nuevo componente?
→ [frontend/README.md - Desarrollo](frontend/README.md#-desarrollo)

### Tengo un error, ¿dónde busco?
→ [README.md - Troubleshooting](README.md#-troubleshooting)  
→ [backend/README.md - Troubleshooting](backend/README.md#-troubleshooting)  
→ [frontend/README.md - Troubleshooting](frontend/README.md#-troubleshooting)

---

## 📦 Archivos de Configuración

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| `.env` | `backend/.env` | Credenciales de Supabase (backend) |
| `.env` | `frontend/.env` | Credenciales de Supabase + API URL (frontend) |
| `requirements.txt` | `backend/requirements.txt` | Dependencias Python |
| `package.json` | `frontend/package.json` | Dependencias Node.js |
| `run.sh` | `backend/run.sh` | Script para iniciar backend |

---

## 🎓 Recursos Externos

### Tecnologías Principales
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/)
- [Vite Docs](https://vitejs.dev/)

### Librerías Importantes
- [Pydantic V2](https://docs.pydantic.dev/latest/)
- [React Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Recharts](https://recharts.org/)

---

## 📞 Comandos Más Usados

```bash
# Iniciar backend
cd backend && source venv/bin/activate && cd .. && uvicorn backend.main:app --reload

# Iniciar frontend
cd frontend && npm run dev

# Ver documentación API
open http://localhost:8000/docs

# Ver aplicación
open http://localhost:5173

# Reinstalar dependencias backend
cd backend && pip install -r requirements.txt

# Reinstalar dependencias frontend
cd frontend && npm install
```

---

**Última actualización:** Diciembre 2024  
**Mantenedor:** Equipo FinanzasApp
