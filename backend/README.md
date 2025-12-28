# 🐍 Backend - FinanzasApp

Backend FastAPI con arquitectura híbrida: Supabase para datos + FastAPI para lógica de negocio.

---

## 🚀 Quick Start

```bash
# 1. Activar entorno virtual
source venv/bin/activate  # En Windows: venv\Scripts\activate

# 2. Volver al directorio raíz
cd ..

# 3. Iniciar servidor
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Servidor disponible en:**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 📦 Instalación (primera vez)

```bash
# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

---

## 🏗️ Arquitectura

```
Frontend → Backend (FastAPI) → Supabase (PostgreSQL)
           ↓
      Valida JWT Token
      Ejecuta lógica de negocio
      Retorna datos
```

### Responsabilidades del Backend:

- ✅ **Validar tokens JWT** de Supabase
- ✅ **Verificar permisos** (is_active, terms_accepted, role)
- ✅ **Lógica de negocio compleja** (agregaciones, cálculos)
- ✅ **CRUD de datos** (transacciones, presupuestos, metas)
- ✅ **Gestión de usuarios** (crear, actualizar, eliminar - solo admins)
- ✅ **Calculadora de impuestos** (sin autenticación)

---

## 📁 Estructura de Archivos

```
backend/
├── main.py                 # Entry point + Calculadora de impuestos
├── database.py             # Cliente de Supabase
├── auth.py                 # Validación de tokens JWT
├── financial_routes.py     # Endpoints CRUD financieros
├── admin_routes.py         # Endpoints de administración de usuarios
├── models.py               # Modelos Pydantic V2
├── requirements.txt        # Dependencias
├── .env                    # Variables de entorno (Supabase)
├── venv/                   # Entorno virtual Python
├── run.sh                  # Script para iniciar servidor
└── README.md               # Este archivo
```

---

## 🔌 API Endpoints

### Públicos (sin autenticación)

#### `GET /`
Health check y información de la API.

**Response:**
```json
{
  "message": "FinanzasApp API - Hybrid Architecture",
  "version": "3.0.0",
  "architecture": {
    "database": "Supabase PostgreSQL",
    "auth": "Supabase Auth",
    "backend": "FastAPI (business logic)"
  }
}
```

#### `POST /api/calculate`
Calculadora de impuestos colombianos 2025 (Persona Natural y SAS).

**Request:**
```json
{
  "legal_status": "natural",
  "monthly_income": 5000000,
  "monthly_expenses": 3000000,
  "afc_contributions": 0,
  "mortgage_interest": 0,
  "patrimony": 0
}
```

**Response:**
```json
{
  "annual_income": 60000000,
  "taxable_income": 60000000,
  "income_tax": 8540000,
  "parafiscales": {...},
  "total_tax_burden": 24280000,
  "net_annual_income": 35720000,
  "effective_tax_rate": 40.47,
  "deductions_applied": 0
}
```

---

### Protegidos (requieren Bearer token)

> Todos estos endpoints requieren header: `Authorization: Bearer <token>`

#### Categorías
- `GET /api/financial/categories` - Listar categorías
- `GET /api/financial/categories?type=gasto` - Filtrar por tipo

#### Transacciones
- `GET /api/financial/transactions` - Listar transacciones
- `GET /api/financial/transactions?month=12&year=2024` - Filtrar
- `POST /api/financial/transactions` - Crear transacción
- `PUT /api/financial/transactions/{id}` - Actualizar
- `DELETE /api/financial/transactions/{id}` - Eliminar

#### Resúmenes
- `GET /api/financial/summary?month=12&year=2024` - Resumen mensual
- `GET /api/financial/summary/monthly?year=2024` - Resúmenes anuales

#### Presupuestos
- `GET /api/financial/budgets?month=12&year=2024` - Listar presupuestos
- `POST /api/financial/budgets` - Crear presupuesto

#### Metas de Ahorro
- `GET /api/financial/savings-goals` - Listar metas
- `POST /api/financial/savings-goals` - Crear meta
- `PUT /api/financial/savings-goals/{id}` - Actualizar progreso

---

## 🔒 Autenticación

### Flujo de Autenticación

1. **Frontend obtiene token de Supabase:**
   ```typescript
   const { data } = await supabase.auth.signInWithPassword({email, password})
   const token = data.session.access_token
   ```

2. **Frontend envía token al backend:**
   ```typescript
   axios.get('/api/financial/transactions', {
     headers: { 'Authorization': `Bearer ${token}` }
   })
   ```

3. **Backend valida token:**
   - Extrae token del header `Authorization`
   - Llama a `client.auth.get_user(token)` de Supabase
   - Obtiene perfil del usuario desde tabla `profiles`
   - Verifica `is_active`, `terms_accepted_at`, `role`
   - Retorna datos o error 401/403

### Middleware de Autenticación

Archivo: `auth.py`

```python
@router.get("/transactions")
async def get_transactions(
    current_user: dict = Depends(get_current_user)  # ← Valida token
):
    user_id = current_user['id']
    role = current_user['role']
    # ...
```

---

## ⚙️ Configuración

### Variables de Entorno (`.env`)

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

> **Nota:** El archivo `.env` ya está configurado con las credenciales de Supabase.

---

## 📦 Dependencias

```txt
fastapi==0.110.0
uvicorn[standard]==0.27.1
pydantic==2.6.1
pydantic-settings==2.1.0
python-multipart==0.0.9
python-dotenv==1.0.0
supabase==2.4.0
postgrest==0.16.0
```

### Actualizar dependencias

```bash
pip install --upgrade -r requirements.txt
```

---

## 🧪 Testing

### Probar imports
```bash
cd ..
source backend/venv/bin/activate
python -c "from backend.main import app; print('✅ OK')"
```

### Probar endpoint público
```bash
curl http://localhost:8000/
```

### Probar con autenticación
```bash
# Primero obtén un token de Supabase, luego:
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/financial/categories
```

### Probar calculadora
```bash
curl -X POST http://localhost:8000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "legal_status": "natural",
    "monthly_income": 5000000,
    "monthly_expenses": 3000000,
    "afc_contributions": 0,
    "mortgage_interest": 0,
    "patrimony": 0
  }'
```

---

## 🐛 Troubleshooting

### Error: "Missing Supabase credentials"
**Solución:**
```bash
# Verificar que .env existe
cat .env

# Verificar variables
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Error: ModuleNotFoundError
**Solución:**
```bash
# Activar entorno virtual
source venv/bin/activate

# Reinstalar dependencias
pip install -r requirements.txt
```

### Error: Permission denied (run.sh)
**Solución:**
```bash
chmod +x run.sh
```

### Backend no responde
**Solución:**
```bash
# Verificar que el puerto 8000 no está ocupado
lsof -i :8000

# Matar proceso si es necesario
kill -9 <PID>

# Reiniciar servidor
uvicorn backend.main:app --reload
```

---

## 🔧 Desarrollo

### Agregar nuevo endpoint

1. **Definir modelo en `models.py`:**
   ```python
   class NewFeatureRequest(BaseModel):
       name: str
       value: float
   ```

2. **Crear endpoint en `financial_routes.py`:**
   ```python
   @router.post("/new-feature")
   async def create_feature(
       data: NewFeatureRequest,
       current_user: dict = Depends(get_current_user),
       client: Client = Depends(get_supabase_client)
   ):
       # Lógica aquí
       return {"message": "Created"}
   ```

3. **Probar en http://localhost:8000/docs**

---

## 📚 Recursos

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Supabase Python Docs](https://supabase.com/docs/reference/python/introduction)
- [Pydantic V2 Docs](https://docs.pydantic.dev/latest/)

---

**Versión:** 3.0.0  
**Última actualización:** Diciembre 2024  
**Estado:** ✅ Funcional
