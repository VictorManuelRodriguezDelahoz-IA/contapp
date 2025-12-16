// Auth types
export interface LoginRequest {
  access_code: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_name: string;
}

// Transaction types
export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'ingreso' | 'gasto';
  category_id: number;
  category_name: string;
  category_color: string;
  category_icon: string;
  date: string;
  month: number;
  year: number;
  notes?: string;
  created_at: string;
}

export interface TransactionCreate {
  description: string;
  amount: number;
  type: 'ingreso' | 'gasto';
  category_id: number;
  date?: string;
  notes?: string;
}

export interface TransactionUpdate {
  description?: string;
  amount?: number;
  type?: 'ingreso' | 'gasto';
  category_id?: number;
  date?: string;
  notes?: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  type: 'ingreso' | 'gasto';
  color: string;
  icon: string;
}

// Summary types
export interface CategorySummary {
  category_name: string;
  category_color: string;
  category_icon: string;
  total: number;
  percentage: number;
}

export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  balance: number;
  expense_by_category: CategorySummary[];
  income_by_category: CategorySummary[];
}

export interface MonthlySummary {
  month: number;
  year: number;
  total_income: number;
  total_expenses: number;
  balance: number;
  top_expense_category?: string;
}

// Tax Calculator types
export interface TaxRequest {
  legal_status: 'natural' | 'sas';
  monthly_income: number;
  monthly_expenses: number;
  afc_contributions: number;
  mortgage_interest: number;
  patrimony: number;
}

export interface ParafiscalesDetail {
  salud: number;
  pension: number;
  arl: number;
  total: number;
}

export interface TaxResponse {
  annual_income: number;
  taxable_income: number;
  income_tax: number;
  parafiscales: ParafiscalesDetail;
  total_tax_burden: number;
  net_annual_income: number;
  effective_tax_rate: number;
  deductions_applied: number;
}
