import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import TaxCalculator from './components/TaxCalculator';
import './App.css';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    if (token) {
      setIsAuthenticated(true);
      setUserName(name || 'Usuario');
    }
  }, []);

  const handleLoginSuccess = (data) => {
    setIsAuthenticated(true);
    setUserName(data.user_name);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    setUserName('');
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">💰</span>
            <span className="logo-text">Finanzas</span>
          </div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </Link>

          <Link
            to="/transactions"
            className={`nav-item ${location.pathname === '/transactions' ? 'active' : ''}`}
          >
            <span className="nav-icon">💳</span>
            <span className="nav-text">Transacciones</span>
          </Link>

          <Link
            to="/tax-calculator"
            className={`nav-item ${location.pathname === '/tax-calculator' ? 'active' : ''}`}
          >
            <span className="nav-icon">🧮</span>
            <span className="nav-text">Calculadora</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/tax-calculator" element={<TaxCalculator />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
