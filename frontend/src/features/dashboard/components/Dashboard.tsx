import { useState } from 'react';
import TrendingUp from '@/components/icons/TrendingUp';
import TrendingDown from '@/components/icons/TrendingDown';
import DollarSign from '@/components/icons/DollarSign';
import { useSummary } from '@/hooks/useSummary';
import { formatCurrency } from '@/utils/currency';
import { MONTHS } from '@/utils/constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#84cc16'];

export default function Dashboard() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { data: summary, isLoading } = useSummary({ month: selectedMonth, year: selectedYear });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-8">
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-gray-400">No hay datos para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-1">Resumen financiero</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 rounded-lg glass border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {MONTHS.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 rounded-lg glass border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ingresos</p>
              <p className="text-3xl font-bold text-green-400 mt-2">
                {formatCurrency(summary.total_income)}
              </p>
            </div>
            <div className="p-4 bg-green-500/20 rounded-full">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Gastos</p>
              <p className="text-3xl font-bold text-red-400 mt-2">
                {formatCurrency(summary.total_expenses)}
              </p>
            </div>
            <div className="p-4 bg-red-500/20 rounded-full">
              <TrendingDown className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        <div className={`glass rounded-2xl p-6 border ${summary.balance >= 0 ? 'border-blue-500/20' : 'border-yellow-500/20'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Balance</p>
              <p className={`text-3xl font-bold mt-2 ${summary.balance >= 0 ? 'text-blue-400' : 'text-yellow-400'}`}>
                {formatCurrency(summary.balance)}
              </p>
            </div>
            <div className={`p-4 rounded-full ${summary.balance >= 0 ? 'bg-blue-500/20' : 'bg-yellow-500/20'}`}>
              <DollarSign className={`w-8 h-8 ${summary.balance >= 0 ? 'text-blue-400' : 'text-yellow-400'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {summary.expense_by_category.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Distribución de Gastos</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={summary.expense_by_category}
                dataKey="total"
                nameKey="category_name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label
              >
                {summary.expense_by_category.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {summary.expense_by_category.length > 0 && (
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Gastos por Categoría</h3>
            <div className="space-y-3">
              {summary.expense_by_category.map((cat, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-2">
                      <span>{cat.category_icon}</span>
                      <span className="text-sm">{cat.category_name}</span>
                    </span>
                    <span className="text-sm font-semibold">{formatCurrency(cat.total)}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.category_color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary.income_by_category.length > 0 && (
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Ingresos por Categoría</h3>
            <div className="space-y-3">
              {summary.income_by_category.map((cat, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-2">
                      <span>{cat.category_icon}</span>
                      <span className="text-sm">{cat.category_name}</span>
                    </span>
                    <span className="text-sm font-semibold">{formatCurrency(cat.total)}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.category_color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
