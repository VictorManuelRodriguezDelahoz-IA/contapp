import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#14b8a6'];

export function ExpensePieChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="chart-empty">
                <p>No hay datos para mostrar</p>
            </div>
        );
    }

    const chartData = data.map(item => ({
        name: item.category_name,
        value: item.total,
        percentage: item.percentage
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString('es-CO')}`} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}

export function CategoryBar({ category, spent, budget }) {
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    const isOverBudget = percentage > 100;

    return (
        <div className="category-bar">
            <div className="category-bar-header">
                <span className="category-name">{category}</span>
                <span className="category-amounts">
                    ${spent.toLocaleString('es-CO')} / ${budget.toLocaleString('es-CO')}
                </span>
            </div>
            <div className="progress-bar">
                <div
                    className={`progress-fill ${isOverBudget ? 'over-budget' : ''}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
            <div className="category-bar-footer">
                <span className={`percentage ${isOverBudget ? 'over-budget-text' : ''}`}>
                    {percentage.toFixed(1)}%
                </span>
            </div>
        </div>
    );
}
