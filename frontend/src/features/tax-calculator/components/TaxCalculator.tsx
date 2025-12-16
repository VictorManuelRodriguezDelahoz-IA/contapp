import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Info from '@/components/icons/Info';
import { taxApi } from '@/api/endpoints';
import { formatCurrency } from '@/utils/currency';
import type { TaxResponse } from '@/types';

const taxSchema = z.object({
  legal_status: z.enum(['natural', 'sas']),
  monthly_income: z.number().positive('Ingresa un monto válido'),
  monthly_expenses: z.number().min(0, 'El monto debe ser positivo'),
  afc_contributions: z.number().min(0, 'El monto debe ser positivo'),
  mortgage_interest: z.number().min(0, 'El monto debe ser positivo'),
  patrimony: z.number().min(0, 'El monto debe ser positivo'),
});

type TaxFormData = z.infer<typeof taxSchema>;

export default function TaxCalculator() {
  const [results, setResults] = useState<TaxResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<TaxFormData>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      legal_status: 'natural',
      monthly_income: 0,
      monthly_expenses: 0,
      afc_contributions: 0,
      mortgage_interest: 0,
      patrimony: 0,
    },
  });

  const legalStatus = watch('legal_status');

  const onSubmit = async (data: TaxFormData) => {
    try {
      setIsLoading(true);
      const response = await taxApi.calculate(data);
      setResults(response.data);
    } catch (error) {
      console.error('Error al calcular impuestos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">Calculadora de Impuestos</h1>
        <p className="text-gray-400 mt-1">Estima tus impuestos según tu situación fiscal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Información Fiscal</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Tabs for Legal Status */}
            <div>
              <div className="flex gap-2 p-1 glass rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    const currentValues = watch();
                    handleSubmit(() => { })(); // Trigger validation
                    // Reset form with new legal status
                    reset({
                      ...currentValues,
                      legal_status: 'natural',
                    });
                    setResults(null); // Clear results when switching tabs
                  }}
                  className={`flex-1 px-4 py-3 rounded-md font-semibold transition-all cursor-pointer ${legalStatus === 'natural'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  Persona Natural
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const currentValues = watch();
                    handleSubmit(() => { })(); // Trigger validation
                    // Reset form with new legal status
                    reset({
                      ...currentValues,
                      legal_status: 'sas',
                      // Clear natural-only fields
                      afc_contributions: 0,
                      mortgage_interest: 0,
                      patrimony: 0,
                    });
                    setResults(null); // Clear results when switching tabs
                  }}
                  className={`flex-1 px-4 py-3 rounded-md font-semibold transition-all cursor-pointer ${legalStatus === 'sas'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  SAS
                </button>
              </div>

              {/* Tab Description */}
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-300">
                  {legalStatus === 'natural'
                    ? '💡 Régimen progresivo (0%, 19%, 28%, 33%) con deducciones disponibles'
                    : '💡 Tarifa fija del 35% sobre ingresos netos'
                  }
                </p>
              </div>
            </div>


            {/* Monthly Income */}
            <div>
              <label htmlFor="monthly_income" className="block text-sm font-medium mb-2">
                Ingresos Mensuales
              </label>
              <input
                id="monthly_income"
                type="number"
                step="0.01"
                {...register('monthly_income', { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-lg glass border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="0.00"
              />
              {errors.monthly_income && (
                <p className="text-red-400 text-sm mt-1">{errors.monthly_income.message}</p>
              )}
            </div>

            {/* Monthly Expenses */}
            <div>
              <label htmlFor="monthly_expenses" className="block text-sm font-medium mb-2">
                Gastos Mensuales Deducibles
              </label>
              <input
                id="monthly_expenses"
                type="number"
                step="0.01"
                {...register('monthly_expenses', { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-lg glass border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="0.00"
              />
              {errors.monthly_expenses && (
                <p className="text-red-400 text-sm mt-1">{errors.monthly_expenses.message}</p>
              )}
            </div>

            {/* AFC Contributions (only for natural) */}
            {legalStatus === 'natural' && (
              <div>
                <label htmlFor="afc_contributions" className="block text-sm font-medium mb-2">
                  Aportes AFC (Ahorro Voluntario)
                </label>
                <input
                  id="afc_contributions"
                  type="number"
                  step="0.01"
                  {...register('afc_contributions', { valueAsNumber: true })}
                  className="w-full px-4 py-3 rounded-lg glass border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="0.00"
                />
                {errors.afc_contributions && (
                  <p className="text-red-400 text-sm mt-1">{errors.afc_contributions.message}</p>
                )}
              </div>
            )}

            {/* Mortgage Interest (only for natural) */}
            {legalStatus === 'natural' && (
              <div>
                <label htmlFor="mortgage_interest" className="block text-sm font-medium mb-2">
                  Intereses de Vivienda
                </label>
                <input
                  id="mortgage_interest"
                  type="number"
                  step="0.01"
                  {...register('mortgage_interest', { valueAsNumber: true })}
                  className="w-full px-4 py-3 rounded-lg glass border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="0.00"
                />
                {errors.mortgage_interest && (
                  <p className="text-red-400 text-sm mt-1">{errors.mortgage_interest.message}</p>
                )}
              </div>
            )}

            {/* Patrimony (only for natural) */}
            {legalStatus === 'natural' && (
              <div>
                <label htmlFor="patrimony" className="block text-sm font-medium mb-2">
                  Patrimonio
                </label>
                <input
                  id="patrimony"
                  type="number"
                  step="0.01"
                  {...register('patrimony', { valueAsNumber: true })}
                  className="w-full px-4 py-3 rounded-lg glass border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="0.00"
                />
                {errors.patrimony && (
                  <p className="text-red-400 text-sm mt-1">{errors.patrimony.message}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? 'Calculando...' : 'Calcular Impuestos'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Resultados</h2>

          {!results ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>Completa el formulario para ver los resultados</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Annual Income */}
              <div className="p-4 glass rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Ingresos Anuales</p>
                <p className="text-2xl font-bold">{formatCurrency(results.annual_income)}</p>
              </div>

              {/* Total Deductions */}
              <div className="p-4 glass rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Deducciones Aplicadas</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(results.deductions_applied)}
                </p>
              </div>

              {/* Taxable Income */}
              <div className="p-4 glass rounded-lg border border-primary/20">
                <p className="text-sm text-gray-400 mb-1">Base Gravable</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(results.taxable_income)}
                </p>
              </div>

              {/* Income Tax */}
              <div className="p-4 glass rounded-lg border border-red-500/20">
                <p className="text-sm text-gray-400 mb-1">Impuesto de Renta</p>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(results.income_tax)}
                </p>
              </div>

              {/* Effective Rate */}
              <div className="p-4 glass rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Tasa Efectiva</p>
                <p className="text-2xl font-bold">{results.effective_tax_rate.toFixed(2)}%</p>
              </div>

              {/* Monthly Tax */}
              <div className="p-4 glass rounded-lg border border-yellow-500/20">
                <p className="text-sm text-gray-400 mb-1">Impuesto Mensual (Estimado)</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {formatCurrency(results.income_tax / 12)}
                </p>
              </div>

              {/* Parafiscales */}
              <div className="p-4 glass rounded-lg">
                <p className="text-sm font-medium mb-3">Parafiscales</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Salud:</span>
                    <span className="font-semibold">{formatCurrency(results.parafiscales.salud)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pensión:</span>
                    <span className="font-semibold">{formatCurrency(results.parafiscales.pension)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ARL:</span>
                    <span className="font-semibold">{formatCurrency(results.parafiscales.arl)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                    <span className="text-gray-400 font-semibold">Total:</span>
                    <span className="font-bold">{formatCurrency(results.parafiscales.total)}</span>
                  </div>
                </div>
              </div>

              {/* Total Tax Burden */}
              <div className="p-4 glass rounded-lg border border-orange-500/20">
                <p className="text-sm text-gray-400 mb-1">Carga Fiscal Total</p>
                <p className="text-2xl font-bold text-orange-400">
                  {formatCurrency(results.total_tax_burden)}
                </p>
              </div>

              {/* Net Income */}
              <div className="p-4 glass rounded-lg border border-green-500/20">
                <p className="text-sm text-gray-400 mb-1">Ingreso Neto Anual</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(results.net_annual_income)}
                </p>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-300">
                  Estos cálculos son estimados y pueden variar según tu situación fiscal específica.
                  Consulta con un contador para información precisa.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
