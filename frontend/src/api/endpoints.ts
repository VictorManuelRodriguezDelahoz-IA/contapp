import apiClient from './client';
import type {
  LoginRequest,
  LoginResponse,
  Transaction,
  TransactionCreate,
  TransactionUpdate,
  Category,
  FinancialSummary,
  MonthlySummary,
  TaxRequest,
  TaxResponse,
} from '@/types';

// Auth
export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', data),
};

// Transactions
export const transactionsApi = {
  list: (params?: { month?: number; year?: number; type?: string; category_id?: number; limit?: number }) =>
    apiClient.get<Transaction[]>('/financial/transactions', { params }),

  create: (data: TransactionCreate) =>
    apiClient.post<Transaction>('/financial/transactions', data),

  update: (id: number, data: TransactionUpdate) =>
    apiClient.put<Transaction>(`/financial/transactions/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/financial/transactions/${id}`),
};

// Categories
export const categoriesApi = {
  list: (type?: 'ingreso' | 'gasto') =>
    apiClient.get<Category[]>('/financial/categories', { params: { type } }),
};

// Summary
export const summaryApi = {
  get: (params?: { month?: number; year?: number }) =>
    apiClient.get<FinancialSummary>('/financial/summary', { params }),

  monthly: (year: number) =>
    apiClient.get<MonthlySummary[]>('/financial/summary/monthly', { params: { year } }),
};

// Tax Calculator (no authentication required)
export const taxApi = {
  calculate: (data: TaxRequest) =>
    apiClient.post<TaxResponse>('/api/calculate', data),
};
