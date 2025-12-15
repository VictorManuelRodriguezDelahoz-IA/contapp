import { useState } from 'react';
import axios from 'axios';
import '../App.css';

function Login({ onLoginSuccess }) {
    const [accessCode, setAccessCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/auth/login', {
                access_code: accessCode
            });

            // Save token to localStorage
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('userName', response.data.user_name);

            // Call success callback
            onLoginSuccess(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Código de acceso inválido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">💰</div>
                    <h1>Gestión Financiera</h1>
                    <p>Ingresa tu código de acceso para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="accessCode">Código de Acceso</label>
                        <input
                            type="text"
                            id="accessCode"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                            placeholder="Ej: FINANZAS2026"
                            required
                            autoFocus
                            className="login-input"
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading || !accessCode}
                    >
                        {loading ? 'Verificando...' : '🔐 Ingresar'}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="hint">💡 Código por defecto: <code>FINANZAS2026</code></p>
                </div>
            </div>
        </div>
    );
}

export default Login;
