from pydantic import BaseModel, Field
from typing import Literal

class TaxRequest(BaseModel):
    """Request model for tax calculation"""
    legal_status: Literal["natural", "sas"] = Field(..., description="Persona Natural o SAS")
    monthly_income: float = Field(..., ge=0, description="Ingresos mensuales en COP")
    monthly_expenses: float = Field(0, ge=0, description="Egresos mensuales en COP")
    afc_contributions: float = Field(0, ge=0, description="Aportes a cuentas AFC anuales")
    mortgage_interest: float = Field(0, ge=0, description="Intereses de crédito hipotecario anuales")
    patrimony: float = Field(0, ge=0, description="Patrimonio total en COP")

class ParafiscalesDetail(BaseModel):
    """Detailed parafiscales breakdown"""
    salud: float
    pension: float
    arl: float
    total: float

class TaxResponse(BaseModel):
    """Response model with calculated taxes"""
    annual_income: float
    taxable_income: float
    income_tax: float
    parafiscales: ParafiscalesDetail
    total_tax_burden: float
    net_annual_income: float
    effective_tax_rate: float
    deductions_applied: float
