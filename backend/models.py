from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# Existing models
class TaxRequest(BaseModel):
    legal_status: str
    monthly_income: float
    monthly_expenses: float
    afc_contributions: float
    mortgage_interest: float
    patrimony: float


class ParafiscalesDetail(BaseModel):
    salud: float
    pension: float
    arl: float
    total: float


class TaxResponse(BaseModel):
    annual_income: float
    taxable_income: float
    income_tax: float
    parafiscales: ParafiscalesDetail
    total_tax_burden: float
    net_annual_income: float
    effective_tax_rate: float
    deductions_applied: float


# New authentication models
class LoginRequest(BaseModel):
    access_code: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_name: str


# Transaction models
class TransactionCreate(BaseModel):
    description: str
    amount: float
    type: str  # "ingreso" or "gasto"
    category_id: int
    date: Optional[datetime] = None
    notes: Optional[str] = None


class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category_id: Optional[int] = None
    date: Optional[datetime] = None
    notes: Optional[str] = None


class TransactionResponse(BaseModel):
    id: int
    description: str
    amount: float
    type: str
    category_id: int
    category_name: str
    category_color: str
    category_icon: str
    date: datetime
    month: int
    year: int
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Category models
class CategoryResponse(BaseModel):
    id: int
    name: str
    type: str
    color: str
    icon: str

    class Config:
        from_attributes = True


# Budget models
class BudgetCreate(BaseModel):
    category_id: int
    amount: float
    month: int
    year: int


class BudgetResponse(BaseModel):
    id: int
    category_id: int
    category_name: str
    amount: float
    month: int
    year: int
    spent: float = 0

    class Config:
        from_attributes = True


# Savings goal models
class SavingsGoalCreate(BaseModel):
    name: str
    target_amount: float
    deadline: Optional[datetime] = None


class SavingsGoalUpdate(BaseModel):
    current_amount: float


class SavingsGoalResponse(BaseModel):
    id: int
    name: str
    target_amount: float
    current_amount: float
    deadline: Optional[datetime]
    created_at: datetime
    completed: bool
    progress_percentage: float

    class Config:
        from_attributes = True


# Summary models
class MonthlySummary(BaseModel):
    month: int
    year: int
    total_income: float
    total_expenses: float
    balance: float
    top_expense_category: Optional[str] = None


class CategorySummary(BaseModel):
    category_name: str
    category_color: str
    category_icon: str
    total: float
    percentage: float


class FinancialSummary(BaseModel):
    total_income: float
    total_expenses: float
    balance: float
    expense_by_category: List[CategorySummary]
    income_by_category: List[CategorySummary]

