import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function TermsModal() {
  const { acceptTerms, user } = useAuth();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    if (!accepted) {
      setError('Debes aceptar los términos y condiciones para continuar');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await acceptTerms();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al aceptar los términos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Términos y Condiciones
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Por favor, lee y acepta los términos para continuar usando FinanzasApp
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-gray-700 dark:text-gray-300">
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              1. Aceptación de los Términos
            </h3>
            <p className="text-sm leading-relaxed">
              Al utilizar FinanzasApp, aceptas estar sujeto a estos términos y condiciones.
              Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestra aplicación.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              2. Privacidad y Protección de Datos
            </h3>
            <p className="text-sm leading-relaxed">
              Tus datos financieros serán almacenados de forma segura en nuestra base de datos.
              Solo tú y los administradores autorizados pueden acceder a tu información personal.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Tus transacciones son privadas y no se comparten con terceros</li>
              <li>Los administradores pueden ver tus datos solo con fines de soporte</li>
              <li>Todos los datos están protegidos mediante cifrado y políticas de seguridad</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              3. Uso Responsable
            </h3>
            <p className="text-sm leading-relaxed">
              Te comprometes a:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Proporcionar información verídica y actualizada</li>
              <li>Mantener la confidencialidad de tu cuenta</li>
              <li>No utilizar la aplicación para actividades ilegales</li>
              <li>No intentar acceder a cuentas de otros usuarios</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              4. Limitación de Responsabilidad
            </h3>
            <p className="text-sm leading-relaxed">
              FinanzasApp es una herramienta de gestión financiera personal. No somos responsables por:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Decisiones financieras tomadas basándose en la información de la app</li>
              <li>Pérdidas o daños derivados del uso de la aplicación</li>
              <li>Exactitud de cálculos de impuestos (consulta con un contador profesional)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              5. Modificaciones
            </h3>
            <p className="text-sm leading-relaxed">
              Nos reservamos el derecho de modificar estos términos en cualquier momento.
              Los cambios serán notificados a través de la aplicación y requerirán tu aceptación nuevamente.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              6. Suspensión de Cuenta
            </h3>
            <p className="text-sm leading-relaxed">
              Los administradores pueden suspender o desactivar tu cuenta en caso de:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Violación de estos términos</li>
              <li>Actividad sospechosa o fraudulenta</li>
              <li>Solicitud del usuario</li>
            </ul>
          </section>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Nota:</strong> Al aceptar estos términos, confirmas que has leído,
              entendido y aceptas cumplir con todas las condiciones establecidas.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => {
                setAccepted(e.target.checked);
                setError('');
              }}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              He leído y acepto los términos y condiciones de uso de FinanzasApp
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!accepted || isLoading}
            className="w-full py-3 bg-gradient-to-r from-primary to-accent rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Procesando...' : 'Aceptar y Continuar'}
          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Usuario: {user?.email}
          </p>
        </div>
      </div>
    </div>
  );
}
