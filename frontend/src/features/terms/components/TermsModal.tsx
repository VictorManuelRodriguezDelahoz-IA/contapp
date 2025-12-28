import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TermsModal() {
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

      // Llamar directamente a Supabase RPC
      const { error: rpcError } = await supabase.rpc('accept_user_terms');

      if (rpcError) {
        throw new Error(`Error al aceptar términos: ${rpcError.message}`);
      }

      // Navegar INMEDIATAMENTE sin esperar ningún refetch
      window.location.href = '/dashboard';

    } catch (err: any) {
      setError(err.message || 'Error al aceptar los términos');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-gray-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Términos y Condiciones
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Última actualización: Diciembre 2025
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-900 bg-white">
          <div className="p-4 rounded-xl bg-info/10 border border-info/30">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-info flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-gray-900">
                Por favor, lee cuidadosamente estos términos antes de usar <strong className="font-semibold text-gray-900">FinanzasApp</strong>.
                Tu aceptación es necesaria para continuar.
              </p>
            </div>
          </div>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
              Aceptación de los Términos
            </h3>
            <p className="text-sm leading-relaxed text-gray-900 pl-8">
              Al utilizar FinanzasApp, aceptas estar sujeto a estos términos y condiciones.
              Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestra aplicación.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">2</span>
              Privacidad y Protección de Datos
            </h3>
            <p className="text-sm leading-relaxed text-gray-900 pl-8">
              Tus datos financieros serán almacenados de forma segura en nuestra base de datos.
              Solo tú y los administradores autorizados pueden acceder a tu información personal.
            </p>
            <ul className="space-y-2 pl-8">
              {[
                'Tus transacciones son privadas y no se comparten con terceros',
                'Los administradores pueden ver tus datos solo con fines de soporte',
                'Todos los datos están protegidos mediante cifrado y políticas de seguridad'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-900">
                  <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">3</span>
              Uso Responsable
            </h3>
            <p className="text-sm leading-relaxed text-gray-900 pl-8">
              Te comprometes a:
            </p>
            <ul className="space-y-2 pl-8">
              {[
                'Proporcionar información verídica y actualizada',
                'Mantener la confidencialidad de tu cuenta',
                'No utilizar la aplicación para actividades ilegales',
                'No intentar acceder a cuentas de otros usuarios'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">4</span>
              Limitación de Responsabilidad
            </h3>
            <p className="text-sm leading-relaxed text-gray-900 pl-8">
              FinanzasApp es una herramienta de gestión financiera personal. No somos responsables por:
            </p>
            <ul className="space-y-2 pl-8">
              {[
                'Decisiones financieras tomadas basándose en la información de la app',
                'Pérdidas o daños derivados del uso de la aplicación',
                'Exactitud de cálculos de impuestos (consulta con un contador profesional)'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-900">
                  <svg className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">5</span>
              Modificaciones
            </h3>
            <p className="text-sm leading-relaxed text-gray-900 pl-8">
              Nos reservamos el derecho de modificar estos términos en cualquier momento.
              Los cambios serán notificados a través de la aplicación y requerirán tu aceptación nuevamente.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">6</span>
              Suspensión de Cuenta
            </h3>
            <p className="text-sm leading-relaxed text-gray-900 pl-8">
              Los administradores pueden suspender o desactivar tu cuenta en caso de:
            </p>
            <ul className="space-y-2 pl-8">
              {[
                'Violación de estos términos',
                'Actividad sospechosa o fraudulenta',
                'Solicitud del usuario'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-error flex-shrink-0 mt-2"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-gray-900">
                <strong className="font-semibold">Importante:</strong> Al aceptar estos términos, confirmas que has leído,
                entendido y aceptas cumplir con todas las condiciones establecidas.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 space-y-4 bg-white">
          {error && (
            <div className="p-4 rounded-xl bg-error/5 border border-error/20 animate-scale-in">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-error flex-1">{error}</p>
              </div>
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl hover:bg-surface/20 transition-colors">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => {
                setAccepted(e.target.checked);
                setError('');
              }}
              className="mt-0.5 w-5 h-5 rounded-md border-2 border-border-default text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer transition-all"
            />
            <span className="text-sm text-gray-900 font-medium">
              He leído y acepto los <span className="text-primary font-semibold">términos y condiciones</span> de uso de FinanzasApp
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!accepted || isLoading}
            className="btn-primary w-full text-base font-semibold py-3"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
            ) : (
              'Aceptar y Continuar'
            )}
          </button>

          <p className="text-xs text-center text-gray-500">
            Al aceptar serás redirigido automáticamente
          </p>
        </div>
      </div>
    </div>
  );
}
