import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'full_user' | 'partial_user';
  is_active: boolean;
  terms_accepted_at: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  const acceptTerms = async () => {
    if (!user) throw new Error('No hay usuario autenticado');

    try {
      // Usar rpc para evitar problemas con RLS
      const { error } = await supabase.rpc('accept_user_terms');

      if (error) {
        console.error('Error al aceptar términos:', error);
        throw new Error(`Error al aceptar términos: ${error.message}`);
      }

      // Refrescar el perfil para obtener la actualización
      await fetchProfile(user.id);
    } catch (error: any) {
      console.error('Error en acceptTerms:', error);
      throw error;
    }
  };

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isActive: profile?.is_active ?? false,
    hasAcceptedTerms: !!profile?.terms_accepted_at,
    userName: profile?.full_name || profile?.email || 'Usuario',
    login,
    logout,
    acceptTerms
  };
};
