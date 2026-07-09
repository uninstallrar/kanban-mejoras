// ============================================================================
//  src/services/authService.ts
//  Toda la lógica de login/logout en un solo lugar.
//  Dos métodos: OAuth con Google y OTP por SMS (sin contraseña).
// ============================================================================
import { supabase } from './supabaseClient';
import type { Profile } from '@/types';

// --- Google OAuth ------------------------------------------------------------
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // Tras autenticar, Google redirige de vuelta a la app.
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
}

// --- OTP por teléfono (paso 1: enviar código SMS) ---------------------------
export async function sendPhoneOtp(phone: string) {
  // El teléfono debe ir en formato E.164, ej: +5491122334455
  const { data, error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw error;
  return data;
}

// --- OTP por teléfono (paso 2: verificar el código recibido) ----------------
export async function verifyPhoneOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data;
}

// --- Cerrar sesión -----------------------------------------------------------
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// --- Sesión actual -----------------------------------------------------------
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// --- Cargar el perfil (con su ROL) del usuario autenticado ------------------
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[Auth] No se pudo cargar el perfil:', error.message);
    return null;
  }
  return data as Profile;
}
