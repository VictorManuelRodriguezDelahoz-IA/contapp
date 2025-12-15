import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'gasto',
        category_id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: ''
    });
    const [filter, setFilter] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchCategories();
        fetchTransactions();
    }, [filter]);

    // Update category_id when type changes
    useEffect(() => {
        const filtered = categories.filter(cat => cat.type === formData.type);
        if (filtered.length > 0 && !filtered.find(cat => cat.id === parseInt(formData.category_id))) {
            setFormData(prev => ({ ...prev, category_id: filtered[0].id }));
        }
    }, [formData.type, categories]);


    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/financial/categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data);
            if (response.data.length > 0 && !formData.category_id) {
                setFormData(prev => ({ ...prev, category_id: response.data[0].id }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await axios.get('/api/financial/transactions', {
                params: filter,
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = {
                ...formData,
                amount: parseFloat(formData.amount),
                category_id: parseInt(formData.category_id),
                date: new Date(formData.date).toISOString()
            };

            if (editingId) {
                await axios.put(`/api/financial/transactions/${editingId}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/financial/transactions', data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            // Reset form
            setFormData({
                description: '',
                amount: '',
                type: 'gasto',
                category_id: categories[0]?.id || '',
                date: format(new Date(), 'yyyy-MM-dd'),
                notes: ''
            });
            setShowForm(false);
            setEditingId(null);
            fetchTransactions();
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Error al guardar la transacción');
        }
    };

    const handleEdit = (transaction) => {
        setFormData({
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            category_id: transaction.category_id,
            date: format(new Date(transaction.date), 'yyyy-MM-dd'),
            notes: transaction.notes || ''
        });
        setEditingId(transaction.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta transacción?')) return;

        try {
            await axios.delete(`/api/financial/transactions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTransactions();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Error al eliminar la transacción');
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value);
    };

    const filteredCategories = categories.filter(cat => cat.type === formData.type);

    return (
        <div className="transactions">
            <div className="transactions-header">
                <h1>💳 Transacciones</h1>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setFormData({
                            description: '',
                            amount: '',
                            type: 'gasto',
                            category_id: categories.find(c => c.type === 'gasto')?.id || '',
                            date: format(new Date(), 'yyyy-MM-dd'),
                            notes: ''
                        });
                    }}
                >
                    {showForm ? '❌ Cancelar' : '➕ Nueva Transacción'}
                </button>
            </div>

            {/* Filter */}
            <div className="filter-bar">
                <select
                    value={filter.month}
                    onChange={(e) => setFilter({ ...filter, month: parseInt(e.target.value) })}
                    className="filter-select"
                >
                    {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((month, i) => (
                        <option key={i} value={i + 1}>{month}</option>
                    ))}
                </select>
                <select
                    value={filter.year}
                    onChange={(e) => setFilter({ ...filter, year: parseInt(e.target.value) })}
                    className="filter-select"
                >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                </select>
            </div>

            {/* Form */}
            {showForm && (
                <div className="transaction-form card">
                    <h2>{editingId ? '✏️ Editar Transacción' : '➕ Nueva Transacción'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Tipo</label>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            value="ingreso"
                                            checked={formData.type === 'ingreso'}
                                            onChange={(e) => {
                                                setFormData({ ...formData, type: e.target.value, category_id: categories.find(c => c.type === 'ingreso')?.id || '' });
                                            }}
                                        />
                                        💵 Ingreso
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            value="gasto"
                                            checked={formData.type === 'gasto'}
                                            onChange={(e) => {
                                                setFormData({ ...formData, type: e.target.value, category_id: categories.find(c => c.type === 'gasto')?.id || '' });
                                            }}
                                        />
                                        💸 Gasto
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Descripción *</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Ej: Supermercado"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Monto (COP) *</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="Ej: 50000"
                                    required
                                    min="0"
                                    step="100"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Categoría *</label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    required
                                >
                                    {filteredCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Fecha *</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Notas</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Notas adicionales (opcional)"
                                rows="2"
                            />
                        </div>

                        <button type="submit" className="btn-primary">
                            {editingId ? '💾 Guardar Cambios' : '➕ Agregar Transacción'}
                        </button>
                    </form>
                </div>
            )}

            {/* Transactions List */}
            <div className="transactions-list">
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💳</div>
                        <h3>No hay transacciones</h3>
                        <p>Agrega tu primera transacción para comenzar</p>
                    </div>
                ) : (
                    transactions.map(transaction => (
                        <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
                            <div className="transaction-icon">
                                {transaction.category_icon}
                            </div>
                            <div className="transaction-details">
                                <h3>{transaction.description}</h3>
                                <p className="transaction-meta">
                                    <span className="category-badge" style={{ backgroundColor: transaction.category_color }}>
                                        {transaction.category_name}
                                    </span>
                                    <span className="transaction-date">
                                        {format(new Date(transaction.date), 'dd MMM yyyy')}
                                    </span>
                                </p>
                                {transaction.notes && <p className="transaction-notes">{transaction.notes}</p>}
                            </div>
                            <div className="transaction-amount">
                                <span className={`amount ${transaction.type}`}>
                                    {transaction.type === 'ingreso' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                </span>
                                <div className="transaction-actions">
                                    <button onClick={() => handleEdit(transaction)} className="btn-icon" title="Editar">
                                        ✏️
                                    </button>
                                    <button onClick={() => handleDelete(transaction.id)} className="btn-icon" title="Eliminar">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Transactions;
