import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import LayoutDashboard from '@/components/icons/LayoutDashboard';
import Receipt from '@/components/icons/Receipt';
import Calculator from '@/components/icons/Calculator';
import LogOut from '@/components/icons/LogOut';
import { useAuth } from '@/hooks/useAuth';

// Lazy load components
const Login = lazy(() => import('@/features/auth/components/Login'));
const Dashboard = lazy(() => import('@/features/dashboard/components/Dashboard'));
const Transactions = lazy(() => import('@/features/transactions/components/Transactions'));
const TaxCalculator = lazy(() => import('@/features/tax-calculator/components/TaxCalculator'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

function AppContent() {
  const { isAuthenticated, userName, login, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Login onLoginSuccess={login} />
      </Suspense>
    );
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            FinanzasApp
          </h1>
          <p className="text-sm text-gray-400 mt-1">{userName}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/dashboard')
              ? 'bg-primary text-white'
              : 'text-gray-300 hover:bg-white/5'
              }`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/transactions"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/transactions')
              ? 'bg-primary text-white'
              : 'text-gray-300 hover:bg-white/5'
              }`}
          >
            <Receipt className="w-5 h-5 flex-shrink-0" />
            <span>Transacciones</span>
          </Link>

          <Link
            to="/tax-calculator"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/tax-calculator')
              ? 'bg-primary text-white'
              : 'text-gray-300 hover:bg-white/5'
              }`}
          >
            <Calculator className="w-5 h-5 flex-shrink-0" />
            <span>Calculadora</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/tax-calculator" element={<TaxCalculator />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
