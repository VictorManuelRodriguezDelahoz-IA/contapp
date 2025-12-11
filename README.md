# Calculadora de Impuestos Colombia 2025

Una aplicación web moderna para calcular impuestos DIAN y parafiscales en Colombia, con tasas actualizadas para 2025.

## 🚀 Características

- **Sin Login**: Acceso inmediato sin necesidad de registro
- **Cálculo en Tiempo Real**: Resultados instantáneos al enviar el formulario
- **Soporte Dual**: Personas Naturales y SAS
- **Tasas 2025**: Actualizado con las tasas tributarias vigentes
- **Diseño Moderno**: Interfaz azul/violeta con animaciones suaves
- **Responsive**: Funciona en desktop, tablet y móvil

## 📊 Cálculos Incluidos

### Impuesto de Renta (DIAN)
- **Persona Natural**: Tarifas progresivas (0%, 19%, 28%, 33%)
- **SAS**: Tarifa fija del 35%

### Parafiscales
- **Salud**: 12.5%
- **Pensión**: 16%
- **ARL**: 0.522% (riesgo mínimo)

### Deducciones
- **AFC**: Hasta 3,800 UVT
- **Intereses Hipotecarios**: Hasta 1,200 UVT

## 🛠️ Tecnologías

- **Backend**: FastAPI (Python)
- **Frontend**: React + Vite
- **Estilos**: CSS moderno con gradientes y animaciones

## 📦 Instalación

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

El backend estará disponible en `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 🎯 Uso

1. Inicia el backend (puerto 8000)
2. Inicia el frontend (puerto 5173)
3. Abre tu navegador en `http://localhost:5173`
4. Completa el formulario con tu información financiera
5. Haz clic en "Calcular Impuestos"
6. Revisa los resultados en tiempo real

## 📝 Campos del Formulario

- **Tipo de Persona**: Natural o SAS
- **Ingresos Mensuales**: Tus ingresos mensuales en COP
- **Egresos Mensuales**: Tus gastos mensuales (informativo)
- **Aportes AFC**: Contribuciones anuales a cuentas AFC
- **Intereses Hipotecarios**: Intereses pagados anualmente
- **Patrimonio**: Valor total de tus activos

## 🎨 Diseño

La aplicación utiliza un esquema de colores azul y violeta con:
- Gradientes modernos
- Animaciones suaves
- Tarjetas con efecto hover
- Diseño responsive
- Tipografía Inter

## 📄 API Endpoints

### `POST /api/calculate`

Calcula impuestos y parafiscales.

**Request Body:**
```json
{
  "legal_status": "natural",
  "monthly_income": 5000000,
  "monthly_expenses": 2000000,
  "afc_contributions": 10000000,
  "mortgage_interest": 5000000,
  "patrimony": 100000000
}
```

**Response:**
```json
{
  "annual_income": 60000000,
  "taxable_income": 45000000,
  "income_tax": 2850000,
  "parafiscales": {
    "salud": 7500000,
    "pension": 9600000,
    "arl": 313200,
    "total": 17413200
  },
  "total_tax_burden": 20263200,
  "net_annual_income": 39736800,
  "effective_tax_rate": 33.77,
  "deductions_applied": 15000000
}
```

## 📊 UVT 2025

Unidad de Valor Tributario: **$47,065 COP**

## ⚖️ Disclaimer

Esta calculadora es una herramienta informativa. Para declaraciones oficiales, consulta con un contador certificado.

## 🔧 Desarrollo

- Backend: Python 3.8+
- Frontend: Node.js 18+
- Hot reload habilitado en ambos entornos

## 📞 Soporte

Para preguntas o reportar problemas, contacta al equipo de desarrollo.
