import { useState } from 'react';
import TrendingUp from '@/components/icons/TrendingUp';
import TrendingDown from '@/components/icons/TrendingDown';
import DollarSign from '@/components/icons/DollarSign';
import CategoryIcon from '@/components/icons/CategoryIcon';
import { useSummary } from '@/hooks/useSummary';
import { formatCurrency } from '@/utils/currency';
import { MONTHS } from '@/utils/constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Apple-inspired modern color palette
const CHART_COLORS = [
  '#AA73F3', // Primary purple
  '#1C145D', // Tertiary dark
  '#FF9F0A', // Warning orange
  '#30D158', // Success green
  '#007AFF', // Info blue
  '#FF3B30', // Error red
  '#5856D6', // Indigo
  '#AF52DE', // Purple accent
];

export default function Dashboard() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { data: summary, isLoading } = useSummary({ month: selectedMonth, year: selectedYear });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary"></div>
          <p className="text-sm text-text-secondary">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-8">
        <div className="card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-surface">
            <svg className="w-8 h-8 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Sin datos disponibles</h3>
          <p className="text-text-secondary">No hay información financiera para este periodo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="sticky top-0 z-50" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E5EA', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight" style={{ color: '#AA73F3' }}>Dashboard</h1>
              <p className="text-text-secondary mt-1">Resumen de tu actividad financiera</p>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="input px-4 py-2 text-sm w-auto min-w-[140px]"
              >
                {MONTHS.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="input px-4 py-2 text-sm w-auto min-w-[100px]"
              >
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Income Card */}
          <div className="card-hover p-6 bg-gradient-to-br from-success/5 to-success/10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div className="px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                +{summary.total_income > 0 ? '100' : '0'}%
              </div>
            </div>
            <p className="text-sm text-text-secondary font-medium mb-1">Ingresos Totales</p>
            <p className="text-3xl font-semibold text-text-primary tracking-tight">
              {formatCurrency(summary.total_income)}
            </p>
          </div>

          {/* Expenses Card */}
          <div className="card-hover p-6 bg-gradient-to-br from-error/5 to-error/10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-error/10">
                <TrendingDown className="w-6 h-6 text-error" />
              </div>
              <div className="px-2.5 py-1 rounded-full bg-error/10 text-error text-xs font-medium">
                {summary.total_expenses > 0 ? '-' : ''}100%
              </div>
            </div>
            <p className="text-sm text-text-secondary font-medium mb-1">Gastos Totales</p>
            <p className="text-3xl font-semibold text-text-primary tracking-tight">
              {formatCurrency(summary.total_expenses)}
            </p>
          </div>

          {/* Balance Card */}
          <div className={`card-hover p-6 ${summary.balance >= 0
            ? 'bg-gradient-to-br from-primary/5 to-primary/10'
            : 'bg-gradient-to-br from-warning/5 to-warning/10'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${summary.balance >= 0 ? 'bg-primary/10' : 'bg-warning/10'}`}>
                <DollarSign className={`w-6 h-6 ${summary.balance >= 0 ? 'text-primary' : 'text-warning'}`} />
              </div>
              <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                summary.balance >= 0
                  ? 'bg-primary/10 text-primary'
                  : 'bg-warning/10 text-warning'
              }`}>
                {summary.balance >= 0 ? 'Positivo' : 'Negativo'}
              </div>
            </div>
            <p className="text-sm text-text-secondary font-medium mb-1">Balance Final</p>
            <p className={`text-3xl font-semibold tracking-tight ${
              summary.balance >= 0 ? 'text-primary' : 'text-warning'
            }`}>
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        {summary.expense_by_category.length > 0 && (
          <div className="card p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold" style={{ color: '#AA73F3' }}>Distribución de Gastos</h2>
              <p className="text-sm text-text-secondary mt-1">Visualización de tus gastos por categoría</p>
            </div>
            <div className="bg-surface/30 rounded-xl p-6">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={summary.expense_by_category}
                    dataKey="total"
                    nameKey="category_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={140}
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {summary.expense_by_category.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #D2D2D7',
                      borderRadius: '12px',
                      padding: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses by Category */}
          {summary.expense_by_category.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold" style={{ color: '#AA73F3' }}>Gastos Detallados</h3>
                <span className="text-xs font-medium bg-primary/10 px-2.5 py-1 rounded-full" style={{ color: '#AA73F3' }}>
                  {summary.expense_by_category.length} categorías
                </span>
              </div>
              <div className="space-y-4">
                {summary.expense_by_category.map((cat, index) => (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${cat.category_color}20` }}>
                          <CategoryIcon emoji={cat.category_icon} className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{cat.category_name}</p>
                          <p className="text-xs text-text-tertiary">{cat.percentage.toFixed(1)}% del total</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-text-primary ml-4">
                        {formatCurrency(cat.total)}
                      </span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500 group-hover:opacity-80"
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

          {/* Income by Category */}
          {summary.income_by_category.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold" style={{ color: '#AA73F3' }}>Ingresos Detallados</h3>
                <span className="text-xs font-medium bg-primary/10 px-2.5 py-1 rounded-full" style={{ color: '#AA73F3' }}>
                  {summary.income_by_category.length} categorías
                </span>
              </div>
              <div className="space-y-4">
                {summary.income_by_category.map((cat, index) => (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${cat.category_color}20` }}>
                          <CategoryIcon emoji={cat.category_icon} className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{cat.category_name}</p>
                          <p className="text-xs text-text-tertiary">{cat.percentage.toFixed(1)}% del total</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-text-primary ml-4">
                        {formatCurrency(cat.total)}
                      </span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500 group-hover:opacity-80"
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
    </div>
  );
}
