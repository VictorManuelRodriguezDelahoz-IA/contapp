import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/api/endpoints';
import { DEFAULT_ACCESS_CODE } from '@/utils/constants';

const loginSchema = z.object({
  access_code: z.string().min(1, 'El código de acceso es requerido'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginProps {
  onLoginSuccess: (token: string, userName: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await authApi.login(data);
      onLoginSuccess(response.data.access_token, response.data.user_name);
    } catch (err) {
      setError('Código de acceso inválido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-accent/20 animate-pulse"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md glass rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Gestión Financiera
          </h1>
          <p className="text-gray-400">Ingresa tu código de acceso</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <input
              {...register('access_code')}
              type="text"
              placeholder="Código de acceso"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            {errors.access_code && (
              <p className="mt-2 text-sm text-red-400">{errors.access_code.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-primary to-accent rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Código por defecto: <span className="font-mono text-primary">{DEFAULT_ACCESS_CODE}</span>
          </p>
        </form>
      </div>
    </div>
  );
}
