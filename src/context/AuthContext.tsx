"use client";

// ============================================================================
//  src/context/AuthContext.tsx
//  Estado global de autenticación: sesión, perfil y rol.
//  Cualquier componente accede con el hook useAuth().
// ============================================================================
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabaseClient';
import { getProfile, signOut as svcSignOut } from '@/services/authService';
import type { Profile } from '@/types';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Carga el perfil (con rol) del usuario actual.
  async function loadProfile(userId: string, email?: string, metadata?: any) {
    try {
      const p = await getProfile(userId);
      
      // Superadmin: Maria del Carmen
      if (p && (p.email === 'contacteconmariadelcarmen@gmail.com' || email === 'contacteconmariadelcarmen@gmail.com') && p.rol !== 'superadmin') {
        p.rol = 'superadmin';
      }
      
      // Admin: Enzo T. (Mapeo administrativo específico)
      if (p && (p.email === 'enzo.t@lamantovana.com.ar' || email === 'enzo.t@lamantovana.com.ar') && !['superadmin', 'admin', 'supervisor', 'federado'].includes(p.rol)) {
        p.rol = 'admin';
      }

      if (!p) {
        if (email === 'contacteconmariadelcarmen@gmail.com') {
          setProfile({
            id: userId,
            nombre: metadata?.full_name || metadata?.name || 'María del Carmen',
            email: 'contacteconmariadelcarmen@gmail.com',
            telefono: null,
            rol: 'superadmin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          return;
        }
        if (email === 'enzo.t@lamantovana.com.ar') {
          setProfile({
            id: userId,
            nombre: metadata?.full_name || metadata?.name || 'Enzo T.',
            email: 'enzo.t@lamantovana.com.ar',
            telefono: null,
            rol: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          return;
        }
      }
      setProfile(p);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Auth] No se pudo cargar el perfil:', err);
      setProfile(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    // 1) Sesión inicial al cargar la app.
    //    Envuelto para que un fallo (red, perfil inexistente) nunca deje la
    //    app colgada en "Cargando…": loading siempre se resuelve.
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data.session);
        if (data.session?.user) {
          await loadProfile(data.session.user.id, data.session.user.email, data.session.user.user_metadata);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[Auth] Error obteniendo la sesión inicial:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // 2) Escucha cambios de sesión (login, logout, refresh de token).
    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, sess) => {
      setSession(sess);
      if (sess?.user) {
        await loadProfile(sess.user.id, sess.user.email, sess.user.user_metadata);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      isAdmin:
        (profile?.rol
          ? ['superadmin', 'admin', 'supervisor', 'federado'].includes(profile.rol)
          : false) ||
        session?.user?.email === 'contacteconmariadelcarmen@gmail.com' ||
        session?.user?.email === 'enzo.t@lamantovana.com.ar',
      signOut: async () => {
        await svcSignOut();
        setProfile(null);
        setSession(null);
      },
      refreshProfile: async () => {
        if (session?.user) {
          await loadProfile(session.user.id, session.user.email, session.user.user_metadata);
        }
      },
    }),
    [session, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook de acceso. Lanza si se usa fuera del provider (error de programación).
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
