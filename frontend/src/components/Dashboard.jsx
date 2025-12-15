import { useState, useEffect } from 'react';
import axios from 'axios';
import { ExpensePieChart } from './Charts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [monthlySummaries, setMonthlySummaries] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchSummary();
        fetchMonthlySummaries();
    }, [selectedMonth, selectedYear]);

    const fetchSummary = async () => {
        try {
            const response = await axios.get(`/api/financial/summary`, {
                params: { month: selectedMonth, year: selectedYear },
                headers: { Authorization: `Bearer ${token}` }
            });
            setSummary(response.data);
        } catch (error) {
            console.error('Error fetching summary:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthlySummaries = async () => {
        try {
            const response = await axios.get(`/api/financial/summary/monthly`, {
                params: { year: selectedYear },
                headers: { Authorization: `Bearer ${token}` }
            });
            setMonthlySummaries(response.data);
        } catch (error) {
            console.error('Error fetching monthly summaries:', error);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>📊 Dashboard Financiero</h1>
                <div className="month-selector">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="month-select"
                    >
                        {months.map((month, index) => (
                            <option key={index} value={index + 1}>{month}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="year-select"
                    >
                        <option value={2024}>2024</option>
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                    </select>
                </div>
            </div>

            {summary && (
                <>
                    {/* Summary Cards */}
                    <div className="metrics-grid">
                        <div className="metric-card income">
                            <div className="metric-icon">💵</div>
                            <div className="metric-content">
                                <h3>Ingresos</h3>
                                <p className="metric-value">{formatCurrency(summary.total_income)}</p>
                            </div>
                        </div>

                        <div className="metric-card expense">
                            <div className="metric-icon">💸</div>
                            <div className="metric-content">
                                <h3>Gastos</h3>
                                <p className="metric-value">{formatCurrency(summary.total_expenses)}</p>
                            </div>
                        </div>

                        <div className={`metric-card balance ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
                            <div className="metric-icon">{summary.balance >= 0 ? '✅' : '⚠️'}</div>
                            <div className="metric-content">
                                <h3>Balance</h3>
                                <p className="metric-value">{formatCurrency(summary.balance)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="charts-grid">
                        {summary.expense_by_category && summary.expense_by_category.length > 0 && (
                            <div className="chart-card">
                                <h2>🍕 Gastos por Categoría</h2>
                                <ExpensePieChart data={summary.expense_by_category} />
                            </div>
                        )}

                        {summary.income_by_category && summary.income_by_category.length > 0 && (
                            <div className="chart-card">
                                <h2>💰 Ingresos por Categoría</h2>
                                <ExpensePieChart data={summary.income_by_category} />
                            </div>
                        )}
                    </div>

                    {/* Category Breakdown */}
                    {summary.expense_by_category && summary.expense_by_category.length > 0 && (
                        <div className="category-breakdown card">
                            <h2>📋 Desglose de Gastos</h2>
                            <div className="category-list">
                                {summary.expense_by_category.map((cat, index) => (
                                    <div key={index} className="category-item">
                                        <div className="category-info">
                                            <span className="category-icon">{cat.category_icon}</span>
                                            <span className="category-name">{cat.category_name}</span>
                                        </div>
                                        <div className="category-stats">
                                            <span className="category-amount">{formatCurrency(cat.total)}</span>
                                            <span className="category-percentage">{cat.percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="category-bar-mini">
                                            <div
                                                className="category-bar-fill"
                                                style={{
                                                    width: `${cat.percentage}%`,
                                                    backgroundColor: cat.category_color
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {!summary || (summary.total_income === 0 && summary.total_expenses === 0) && (
                <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>No hay datos para este mes</h3>
                    <p>Comienza agregando transacciones para ver tu resumen financiero</p>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
