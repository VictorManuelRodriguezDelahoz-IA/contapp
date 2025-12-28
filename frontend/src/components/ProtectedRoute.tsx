import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireFullAccess?: boolean; // Bloquea partial_user (para Calculadora de Impuestos)
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireFullAccess = false
}: ProtectedRouteProps) => {
  const { isAuthenticated, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Verificar si está activo
  if (!profile?.is_active) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Cuenta Desactivada</h1>
        <p className="text-gray-600 text-center">
          Tu cuenta ha sido desactivada por un administrador.
        </p>
      </div>
    );
  }

  // Verificar términos aceptados
  if (!profile?.terms_accepted_at) {
    return <Navigate to="/terms" replace />;
  }

  // Verificar si requiere admin
  if (requireAdmin && profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
        <p className="text-gray-600 text-center">
          No tienes permisos para acceder a esta página.
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          Volver
        </button>
      </div>
    );
  }

  // Verificar si requiere acceso completo (bloquea partial_user)
  if (requireFullAccess && profile?.role === 'partial_user') {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl font-bold text-orange-600 mb-4">Acceso Limitado</h1>
        <p className="text-gray-600 mb-2 text-center">
          Tu cuenta no tiene acceso a la Calculadora de Impuestos.
        </p>
        <p className="text-sm text-gray-500 text-center">
          Contacta a un administrador si necesitas acceso completo.
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          Volver
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
