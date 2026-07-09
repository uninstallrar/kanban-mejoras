// ============================================================================
//  src/services/supabaseClient.ts
//  Instancia única del cliente de Supabase.
//  Las credenciales vienen de variables de entorno (.env / Vercel).
//
//  IMPORTANTE: este módulo NUNCA debe lanzar una excepción al cargarse.
//  Si faltan las variables, createClient() arrojaría "supabaseUrl is required"
//  durante el import y la app entera quedaría en pantalla blanca. Por eso
//  detectamos la falta de configuración y, en ese caso, creamos el cliente con
//  valores ficticios válidos (no se usará) y exponemos `isSupabaseConfigured`
//  para que la UI muestre una pantalla de configuración en lugar de romperse.
// ============================================================================
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Bandera pública: ¿están presentes las credenciales reales?
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.error(
    '[Supabase] Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.\n' +
      'Copia .env.example a .env, completa tus credenciales y reinicia el servidor dev.',
  );
}

// Valores ficticios pero con formato VALIDO para que createClient no lance
// durante la carga del modulo cuando aun no hay .env configurado.
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'public-anon-placeholder-key';

export const supabase = createClient(
  supabaseUrl || FALLBACK_URL,
  supabaseAnonKey || FALLBACK_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // necesario para el callback de OAuth (Google)
    },
  },
);

// Nombre del bucket de Storage (configurable por entorno).
export const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'adjuntos';
