# Gestión Financiera Personal 2.0

Una aplicación web moderna y completa para gestionar tus finanzas personales y calcular impuestos en Colombia.

## 🚀 Características

### 💰 Gestión Financiera
- **Dashboard Interactivo**: Visualiza tus ingresos, gastos y balance en tiempo real
- **Transacciones**: Registra y categoriza todos tus movimientos financieros
- **Gráficos de Torta**: Visualiza la distribución de tus gastos por categoría
- **Filtros Avanzados**: Filtra transacciones por mes y año
- **14 Categorías Predefinidas**: Desde alimentación hasta inversiones

### 🧮 Calculadora de Impuestos Colombia 2025
- **Personas Naturales**: Tarifas progresivas (0%, 19%, 28%, 33%)
- **SAS**: Tarifa fija del 35%
- **Parafiscales**: Salud (12.5%), Pensión (16%), ARL (0.522%)
- **Deducciones**: AFC (hasta 3,800 UVT), Intereses Hipotecarios (hasta 1,200 UVT)

### 🔐 Autenticación Simple
- Acceso con código personalizado
- Sesión persistente
- Ideal para uso personal

### 🎨 Diseño Premium
- Tema oscuro moderno
- Gradientes vibrantes
- Animaciones suaves
- 100% responsive
- Tipografía Inter

## 📦 Instalación

### Requisitos
- Python 3.8+
- Node.js 18+

### Backend

```bash
# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
uvicorn backend.main:app --reload --port 8000
```

El backend estará disponible en `http://localhost:8000`

### Frontend

```bash
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 🎯 Uso

### 1. Acceder a la Aplicación
1. Abre tu navegador en `http://localhost:5173`
2. Ingresa el código de acceso: `FINANZAS2026`
3. Haz clic en "Ingresar"

### 2. Dashboard
- Visualiza tus métricas financieras
- Selecciona mes y año para filtrar
- Observa gráficos de distribución de gastos

### 3. Transacciones
- Haz clic en "Nueva Transacción"
- Selecciona tipo (Ingreso o Gasto)
- Completa descripción, monto y categoría
- Agrega notas opcionales
- Edita o elimina transacciones existentes

### 4. Calculadora de Impuestos
- Selecciona tu tipo de persona (Natural o SAS)
- Ingresa tus datos financieros
- Haz clic en "Calcular Impuestos"
- Revisa los resultados detallados

## 🗂️ Estructura del Proyecto

```
Contaapp/
├── backend/
│   ├── main.py              # FastAPI app principal
│   ├── database.py          # Modelos SQLAlchemy
│   ├── auth.py              # Autenticación JWT
│   ├── financial_routes.py  # Rutas financieras
│   └── models.py            # Modelos Pydantic
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Transactions.jsx
│   │   │   ├── TaxCalculator.jsx
│   │   │   └── Charts.jsx
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
├── finanzas.db              # Base de datos SQLite (se crea automáticamente)
└── requirements.txt
```

## 📊 Categorías Predeterminadas

### Ingresos
- 💼 Salario
- 💻 Freelance
- 📈 Inversiones
- 💵 Otros Ingresos

### Gastos
- 🍔 Alimentación
- 🚗 Transporte
- 🏠 Vivienda
- 💡 Servicios
- 🏥 Salud
- 📚 Educación
- 🎮 Entretenimiento
- 👕 Ropa
- 🏦 Ahorro
- 💸 Otros Gastos

## 🔧 Tecnologías

### Backend
- **FastAPI**: Framework web moderno y rápido
- **SQLAlchemy**: ORM para base de datos
- **SQLite**: Base de datos local
- **JWT**: Autenticación con tokens
- **Pydantic**: Validación de datos

### Frontend
- **React 19**: Biblioteca UI
- **React Router**: Navegación
- **Recharts**: Gráficos interactivos
- **Axios**: Cliente HTTP
- **date-fns**: Manejo de fechas

## 🎨 Personalización

### Cambiar Código de Acceso

Edita `backend/database.py` en la función `init_db()`:

```python
default_user = User(access_code="TU_CODIGO_AQUI", name="Tu Nombre")
```

### Agregar Categorías

Edita `backend/database.py` en la función `init_db()` y agrega nuevas categorías:

```python
Category(name="Nueva Categoría", type="gasto", color="#ff0000", icon="🎯")
```

## 📱 Responsive Design

La aplicación se adapta perfectamente a:
- 🖥️ Desktop (1920px+)
- 💻 Laptop (1024px+)
- 📱 Tablet (768px+)
- 📱 Móvil (320px+)

## 🔒 Seguridad

- Autenticación con JWT
- Tokens con expiración de 7 días
- Rutas protegidas en el backend
- Validación de datos con Pydantic

> ⚠️ **Nota**: Esta aplicación está diseñada para uso personal local. Para producción, considera implementar medidas de seguridad adicionales.

## 📄 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login con código de acceso

### Transacciones
- `GET /api/financial/transactions` - Listar transacciones
- `POST /api/financial/transactions` - Crear transacción
- `PUT /api/financial/transactions/{id}` - Actualizar transacción
- `DELETE /api/financial/transactions/{id}` - Eliminar transacción

### Resúmenes
- `GET /api/financial/summary` - Resumen financiero
- `GET /api/financial/summary/monthly` - Resúmenes mensuales

### Categorías
- `GET /api/financial/categories` - Listar categorías

### Impuestos
- `POST /api/calculate` - Calcular impuestos

## 🐛 Solución de Problemas

### El backend no inicia
```bash
# Verifica que las dependencias estén instaladas
pip install -r requirements.txt

# Verifica la versión de Python
python --version  # Debe ser 3.8+
```

### El frontend no inicia
```bash
# Limpia node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

### Error de CORS
Verifica que el backend esté corriendo en el puerto 8000 y el frontend en 5173.

## 📞 Soporte

Para preguntas o problemas, revisa:
1. La documentación en este README
2. El archivo `walkthrough.md` para ejemplos de uso
3. Los comentarios en el código fuente

## 📝 Licencia

Este proyecto es de uso personal. Siéntete libre de modificarlo según tus necesidades.

## 🎉 Créditos

Desarrollado con ❤️ para gestionar finanzas personales de manera profesional y eficiente.

---

**Versión**: 2.0.0  
**Última actualización**: Diciembre 2024
