import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Pencil from '@/components/icons/Pencil';
import Trash2 from '@/components/icons/Trash2';
import {
  useTransactions,
  useCategories,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from '@/hooks/useTransactions';
import { formatCurrency } from '@/utils/currency';
import { MONTHS } from '@/utils/constants';
import type { TransactionCreate, Transaction } from '@/types';

const transactionSchema = z.object({
  description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres'),
  amount: z.number().positive('El monto debe ser positivo'),
  type: z.enum(['ingreso', 'gasto']),
  category_id: z.number().positive('Selecciona una categoría'),
  date: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function Transactions() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [transactionType, setTransactionType] = useState<'ingreso' | 'gasto'>('gasto');

  const { data: transactions, isLoading } = useTransactions({ month: selectedMonth, year: selectedYear });
  const { data: categories } = useCategories(transactionType);
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'gasto',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const watchedType = watch('type');

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
      } else {
        await createMutation.mutateAsync(data as TransactionCreate);
      }
      reset({
        type: 'gasto',
        date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error al guardar transacción:', error);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setTransactionType(transaction.type);
    setValue('description', transaction.description);
    setValue('amount', transaction.amount);
    setValue('type', transaction.type);
    setValue('category_id', transaction.category_id);
    setValue('date', transaction.date.split('T')[0]);
    setValue('notes', transaction.notes || '');
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta transacción?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCancelEdit = () => {
    reset({
      type: 'gasto',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Actualizar transactionType cuando cambia el tipo en el formulario
  const handleTypeChange = (newType: 'ingreso' | 'gasto') => {
    setTransactionType(newType);
    setValue('type', newType);
    setValue('category_id', 0); // Reset category when type changes
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Transacciones</h1>
          <p className="text-gray-400 mt-1">Gestiona tus ingresos y gastos</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition-colors cursor-pointer"
        >
          {showForm ? 'Cancelar' : '+ Nueva Transacción'}
        </button>
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

      {/* Form */}
      {showForm && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">
            {editingId ? 'Editar Transacción' : 'Nueva Transacción'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleTypeChange('gasto')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors cursor-pointer ${watchedType === 'gasto'
                    ? 'bg-red-500 text-white'
                    : 'glass border border-white/10 hover:border-red-500/50'
                    }`}
                >
                  Gasto
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('ingreso')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors cursor-pointer ${watchedType === 'ingreso'
                    ? 'bg-green-500 text-white'
                    : 'glass border border-white/10 hover:border-green-500/50'
                    }`}
                >
                  Ingreso
                </button>
              </div>
              <input type="hidden" {...register('type')} />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Descripción
              </label>
              <input
                id="description"
                type="text"
                {...register('description')}
                className="w-full px-4 py-3 rounded-lg glass border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Ej: Compra de supermercado"
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-2">
                Monto
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-lg glass border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium mb-2">
                Categoría
              </label>
              <select
                id="category_id"
                {...register('category_id', { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-lg glass border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Selecciona una categoría</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-red-400 text-sm mt-1">{errors.category_id.message}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Fecha
              </label>
              <input
                id="date"
                type="date"
                {...register('date')}
                className="w-full px-4 py-3 rounded-lg glass border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-2">
                Notas (opcional)
              </label>
              <textarea
                id="notes"
                {...register('notes')}
                rows={3}
                className="w-full px-4 py-3 rounded-lg glass border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Información adicional..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-3 glass border border-white/10 hover:border-white/20 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Transactions List */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6">
          Transacciones de {MONTHS[selectedMonth - 1]} {selectedYear}
        </h2>

        {!transactions || transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No hay transacciones registradas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 glass rounded-lg border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${transaction.type === 'ingreso' ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}
                  >
                    {transaction.category_icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{transaction.description}</h3>
                      <span className="text-xs text-gray-400">
                        {transaction.category_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-400">
                        {new Date(transaction.date).toLocaleDateString('es-ES')}
                      </p>
                      {transaction.notes && (
                        <p className="text-sm text-gray-500">• {transaction.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-xl font-bold ${transaction.type === 'ingreso' ? 'text-green-400' : 'text-red-400'
                        }`}
                    >
                      {transaction.type === 'ingreso' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="p-2 glass hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 glass hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
