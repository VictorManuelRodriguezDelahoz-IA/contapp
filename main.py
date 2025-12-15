from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import TaxRequest, TaxResponse, ParafiscalesDetail

app = FastAPI(title="Colombian Tax Calculator API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2025 Colombian Tax Rates
INCOME_TAX_BRACKETS_2025 = [
    (0, 1400 * 95000, 0.00),           # 0% hasta ~133M COP
    (1400 * 95000, 3500 * 95000, 0.19), # 19% hasta ~332M COP
    (3500 * 95000, 9200 * 95000, 0.28), # 28% hasta ~874M COP
    (9200 * 95000, float('inf'), 0.33), # 33% en adelante
]

SAS_TAX_RATE_2025 = 0.35  # 35% flat rate for SAS
PARAFISCALES_RATES = {
    "salud": 0.125,      # 12.5% (8.5% empleador + 4% empleado)
    "pension": 0.16,     # 16% (12% empleador + 4% empleado)
    "arl": 0.00522       # 0.522% (riesgo I - mínimo)
}

# UVT 2025 (Unidad de Valor Tributario)
UVT_2025 = 47065  # COP

def calculate_income_tax_natural(annual_income: float, deductions: float) -> float:
    """Calculate progressive income tax for natural persons (2025 rates)"""
    taxable_income = max(0, annual_income - deductions)
    tax = 0.0
    
    for i, (lower, upper, rate) in enumerate(INCOME_TAX_BRACKETS_2025):
        if taxable_income <= lower:
            break
        
        bracket_income = min(taxable_income, upper) - lower
        tax += bracket_income * rate
        
        if taxable_income <= upper:
            break
    
    return tax

def calculate_income_tax_sas(annual_income: float) -> float:
    """Calculate flat income tax for SAS (2025 rate)"""
    return annual_income * SAS_TAX_RATE_2025

def calculate_parafiscales(monthly_income: float) -> ParafiscalesDetail:
    """Calculate parafiscales (health, pension, ARL) - monthly basis"""
    # Parafiscales are calculated on salary income
    # For simplification, we apply to monthly income
    
    salud = monthly_income * PARAFISCALES_RATES["salud"]
    pension = monthly_income * PARAFISCALES_RATES["pension"]
    arl = monthly_income * PARAFISCALES_RATES["arl"]
    
    return ParafiscalesDetail(
        salud=round(salud, 2),
        pension=round(pension, 2),
        arl=round(arl, 2),
        total=round(salud + pension + arl, 2)
    )

def calculate_deductions(afc: float, mortgage_interest: float) -> float:
    """Calculate total deductions (AFC + mortgage interest)"""
    # AFC: Max 30% of annual income, up to 3,800 UVT
    max_afc = 3800 * UVT_2025
    afc_deduction = min(afc, max_afc)
    
    # Mortgage interest: Max 1,200 UVT
    max_mortgage = 1200 * UVT_2025
    mortgage_deduction = min(mortgage_interest, max_mortgage)
    
    return afc_deduction + mortgage_deduction

@app.get("/")
async def root():
    return {
        "message": "Colombian Tax Calculator API - 2025",
        "version": "1.0.0",
        "endpoints": {
            "calculate": "/api/calculate (POST)"
        }
    }

@app.post("/api/calculate", response_model=TaxResponse)
async def calculate_taxes(request: TaxRequest):
    """
    Calculate Colombian taxes and parafiscales based on user input
    
    - **legal_status**: "natural" (Persona Natural) or "sas" (SAS)
    - **monthly_income**: Monthly income in COP
    - **monthly_expenses**: Monthly expenses in COP (informational)
    - **afc_contributions**: Annual AFC contributions in COP
    - **mortgage_interest**: Annual mortgage interest paid in COP
    - **patrimony**: Total patrimony in COP (informational)
    """
    
    # Calculate annual income
    annual_income = request.monthly_income * 12
    
    # Calculate deductions
    deductions = calculate_deductions(
        request.afc_contributions,
        request.mortgage_interest
    )
    
    # Calculate income tax based on legal status
    if request.legal_status == "natural":
        income_tax = calculate_income_tax_natural(annual_income, deductions)
    else:  # SAS
        income_tax = calculate_income_tax_sas(annual_income)
    
    # Calculate parafiscales (monthly, then annualize)
    parafiscales_monthly = calculate_parafiscales(request.monthly_income)
    parafiscales_annual = ParafiscalesDetail(
        salud=parafiscales_monthly.salud * 12,
        pension=parafiscales_monthly.pension * 12,
        arl=parafiscales_monthly.arl * 12,
        total=parafiscales_monthly.total * 12
    )
    
    # Calculate totals
    total_tax_burden = income_tax + parafiscales_annual.total
    taxable_income = annual_income - deductions if request.legal_status == "natural" else annual_income
    net_annual_income = annual_income - total_tax_burden
    effective_tax_rate = (total_tax_burden / annual_income * 100) if annual_income > 0 else 0
    
    return TaxResponse(
        annual_income=round(annual_income, 2),
        taxable_income=round(taxable_income, 2),
        income_tax=round(income_tax, 2),
        parafiscales=ParafiscalesDetail(
            salud=round(parafiscales_annual.salud, 2),
            pension=round(parafiscales_annual.pension, 2),
            arl=round(parafiscales_annual.arl, 2),
            total=round(parafiscales_annual.total, 2)
        ),
        total_tax_burden=round(total_tax_burden, 2),
        net_annual_income=round(net_annual_income, 2),
        effective_tax_rate=round(effective_tax_rate, 2),
        deductions_applied=round(deductions, 2)
    )