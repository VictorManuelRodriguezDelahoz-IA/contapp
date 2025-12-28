import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import LayoutDashboard from '@/components/icons/LayoutDashboard';
import Receipt from '@/components/icons/Receipt';
import Calculator from '@/components/icons/Calculator';
import Users from '@/components/icons/Users';
import LogOut from '@/components/icons/LogOut';
import logoImage from '@/assets/logo.jpeg';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy load components
const Login = lazy(() => import('@/features/auth/components/Login'));
const Dashboard = lazy(() => import('@/features/dashboard/components/Dashboard'));
const Transactions = lazy(() => import('@/features/transactions/components/Transactions'));
const TaxCalculator = lazy(() => import('@/features/tax-calculator/components/TaxCalculator'));
const TermsModal = lazy(() => import('@/features/terms/components/TermsModal'));
const AdminPanel = lazy(() => import('@/features/admin/components/AdminPanel'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-surface">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary"></div>
      <p className="text-sm text-text-secondary">Cargando...</p>
    </div>
  </div>
);

function AppContent() {
  const { isAuthenticated, userName, profile, logout, loading, hasAcceptedTerms } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación o se carga el perfil
  if (loading) {
    return <LoadingSpinner />;
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Login />
      </Suspense>
    );
  }

  // Si está autenticado pero el perfil NO está cargado todavía, mostrar loading
  if (isAuthenticated && !profile) {
    return <LoadingSpinner />;
  }

  // Si está autenticado pero no ha aceptado términos, mostrar modal bloqueante
  if (isAuthenticated && !hasAcceptedTerms) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <TermsModal />
      </Suspense>
    );
  }

  // Si la cuenta está desactivada (en este punto profile ya está garantizado que existe)
  if (profile && !profile.is_active) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 bg-surface">
        <div className="card p-8 max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-error/10">
            <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-3">Cuenta Desactivada</h1>
          <p className="text-text-secondary mb-6">
            Tu cuenta ha sido desactivada por un administrador. Contacta con soporte para más información.
          </p>
          <button
            onClick={logout}
            className="btn-primary w-full"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => location.pathname === path;

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      'admin': 'Administrador',
      'full_user': 'Usuario Pro',
      'partial_user': 'Usuario Básico',
    };
    return roleMap[role] || role;
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transacciones', icon: Receipt },
  ];

  // Add calculator if not partial user
  if (profile?.role !== 'partial_user') {
    navItems.push({ path: '/tax-calculator', label: 'Calculadora', icon: Calculator });
  }

  // Add admin panel if admin
  if (profile?.role === 'admin') {
    navItems.push({ path: '/admin', label: 'Administración', icon: Users });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar - Apple-inspired */}
      <aside className="w-72 bg-background-card border-r border-border-light flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border-light">
          <div className="flex items-center justify-center mb-4">
            <img src={logoImage} alt="Numerika Consultores" className="h-20 w-auto object-contain" />
          </div>

          {/* User Info */}
          <div className="p-3 rounded-xl bg-surface/50 border border-border-light">
            <p className="text-sm font-medium text-text-primary truncate">{userName}</p>
            {profile?.role && (
              <span className="inline-flex items-center mt-1.5 px-2 py-0.5 text-xs font-medium rounded-md bg-primary/10 text-primary">
                {getRoleLabel(profile.role)}
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                isActive(path)
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive(path) ? 'text-primary' : ''}`} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border-light">
          <button
            onClick={logout}
            className="w-full px-4 py-2.5 bg-surface hover:bg-surface-dark border border-border-light text-text-secondary hover:text-error rounded-lg transition-all flex items-center justify-center gap-2 font-medium text-sm cursor-pointer"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-surface">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Rutas protegidas para todos los usuarios autenticados */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />

            {/* Calculadora - Bloqueada para partial_user */}
            <Route
              path="/tax-calculator"
              element={
                <ProtectedRoute requireFullAccess>
                  <TaxCalculator />
                </ProtectedRoute>
              }
            />

            {/* Admin Panel - Solo para admins */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
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
