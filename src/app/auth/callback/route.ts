// ============================================================================
//  src/app/auth/callback/route.ts
//  Ruta de callback para el intercambio de tokens de OAuth (Google).
//  Intercambia el código de autorización ('code') por una sesión en el servidor
//  y redirige de vuelta a la app con los tokens en el hash para que el cliente
//  de Supabase (con detectSessionInUrl: true) los detecte y persista.
// ============================================================================
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      // Cliente temporal para el servidor
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
        },
      });

      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data?.session) {
          const { access_token, refresh_token } = data.session;
          // Redirige pasando los tokens en el hash. El cliente de Supabase los
          // levantará automáticamente de la URL y los guardará en localStorage.
          return NextResponse.redirect(
            `${origin}${next}#access_token=${access_token}&refresh_token=${refresh_token}&type=signup`
          );
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[Auth Callback] Error intercambiando código:', err);
      }
    }
  }

  // En caso de error, volvemos a la página principal
  return NextResponse.redirect(`${origin}${next}`);
}
