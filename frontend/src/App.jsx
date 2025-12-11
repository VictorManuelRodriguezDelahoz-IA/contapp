import { useState } from 'react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    legal_status: 'natural',
    monthly_income: '',
    monthly_expenses: '',
    afc_contributions: '',
    mortgage_interest: '',
    patrimony: ''
  })

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const handleCalculate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          legal_status: formData.legal_status,
          monthly_income: parseFloat(formData.monthly_income) || 0,
          monthly_expenses: parseFloat(formData.monthly_expenses) || 0,
          afc_contributions: parseFloat(formData.afc_contributions) || 0,
          mortgage_interest: parseFloat(formData.mortgage_interest) || 0,
          patrimony: parseFloat(formData.patrimony) || 0
        })
      })

      if (!response.ok) {
        throw new Error('Error al calcular impuestos')
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>💰 Calculadora de Impuestos Colombia 2025</h1>
        <p>Calcula tus impuestos DIAN y parafiscales de forma rápida y precisa</p>
      </header>

      <div className="main-content">
        {/* Form Section */}
        <div className="card">
          <h2>📊 Información Financiera</h2>
          <form onSubmit={handleCalculate}>
            <div className="form-group">
              <label>Tipo de Persona</label>
              <div className="radio-group">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="natural"
                    name="legal_status"
                    value="natural"
                    checked={formData.legal_status === 'natural'}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="natural" className="radio-label">
                    Persona Natural
                  </label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="sas"
                    name="legal_status"
                    value="sas"
                    checked={formData.legal_status === 'sas'}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="sas" className="radio-label">
                    SAS
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="monthly_income">
                Ingresos Mensuales (COP)
                <span className="info-badge">Requerido</span>
              </label>
              <input
                type="number"
                id="monthly_income"
                name="monthly_income"
                value={formData.monthly_income}
                onChange={handleInputChange}
                placeholder="Ej: 5000000"
                required
                min="0"
                step="1000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="monthly_expenses">Egresos Mensuales (COP)</label>
              <input
                type="number"
                id="monthly_expenses"
                name="monthly_expenses"
                value={formData.monthly_expenses}
                onChange={handleInputChange}
                placeholder="Ej: 2000000"
                min="0"
                step="1000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="afc_contributions">
                Aportes AFC Anuales (COP)
                <span className="tooltip" title="Ahorro para el Fomento de la Construcción">ℹ️</span>
              </label>
              <input
                type="number"
                id="afc_contributions"
                name="afc_contributions"
                value={formData.afc_contributions}
                onChange={handleInputChange}
                placeholder="Ej: 10000000"
                min="0"
                step="100000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mortgage_interest">
                Intereses Hipotecarios Anuales (COP)
              </label>
              <input
                type="number"
                id="mortgage_interest"
                name="mortgage_interest"
                value={formData.mortgage_interest}
                onChange={handleInputChange}
                placeholder="Ej: 5000000"
                min="0"
                step="100000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="patrimony">Patrimonio Total (COP)</label>
              <input
                type="number"
                id="patrimony"
                name="patrimony"
                value={formData.patrimony}
                onChange={handleInputChange}
                placeholder="Ej: 100000000"
                min="0"
                step="1000000"
              />
            </div>

            <button type="submit" className="calculate-btn" disabled={loading}>
              {loading ? 'Calculando...' : '🧮 Calcular Impuestos'}
            </button>

            {error && (
              <div className="error">
                ⚠️ {error}
              </div>
            )}
          </form>
        </div>

        {/* Results Section */}
        <div className="results-container">
          <div className="card">
            <h2>📈 Resultados</h2>

            {loading && (
              <div className="loading">
                <div className="spinner"></div>
                <p>Calculando tus impuestos...</p>
              </div>
            )}

            {!loading && !results && (
              <div className="results-empty">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p>Completa el formulario y haz clic en "Calcular Impuestos" para ver tus resultados</p>
              </div>
            )}

            {!loading && results && (
              <>
                <div className="result-item highlight">
                  <div className="result-label">💵 Ingreso Neto Anual</div>
                  <div className="result-value large">{formatCurrency(results.net_annual_income)}</div>
                </div>

                <div className="result-item">
                  <div className="result-label">📊 Ingreso Anual Bruto</div>
                  <div className="result-value">{formatCurrency(results.annual_income)}</div>
                </div>

                <div className="result-item">
                  <div className="result-label">💼 Ingreso Gravable</div>
                  <div className="result-value">{formatCurrency(results.taxable_income)}</div>
                </div>

                <div className="result-item">
                  <div className="result-label">🏛️ Impuesto de Renta (DIAN)</div>
                  <div className="result-value">{formatCurrency(results.income_tax)}</div>
                </div>

                <div className="result-item">
                  <div className="result-label">🏥 Parafiscales Totales</div>
                  <div className="result-value">{formatCurrency(results.parafiscales.total)}</div>

                  <div className="parafiscales-breakdown">
                    <div className="parafiscal-item">
                      <h4>Salud</h4>
                      <p>{formatCurrency(results.parafiscales.salud)}</p>
                    </div>
                    <div className="parafiscal-item">
                      <h4>Pensión</h4>
                      <p>{formatCurrency(results.parafiscales.pension)}</p>
                    </div>
                    <div className="parafiscal-item">
                      <h4>ARL</h4>
                      <p>{formatCurrency(results.parafiscales.arl)}</p>
                    </div>
                  </div>
                </div>

                <div className="result-item highlight">
                  <div className="result-label">💰 Carga Tributaria Total</div>
                  <div className="result-value">{formatCurrency(results.total_tax_burden)}</div>
                </div>

                <div className="result-item">
                  <div className="result-label">📉 Tasa Efectiva de Impuestos</div>
                  <div className="result-value">{results.effective_tax_rate.toFixed(2)}%</div>
                </div>

                {results.deductions_applied > 0 && (
                  <div className="result-item">
                    <div className="result-label">✅ Deducciones Aplicadas</div>
                    <div className="result-value">{formatCurrency(results.deductions_applied)}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
