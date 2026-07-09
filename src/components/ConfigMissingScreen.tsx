// ============================================================================
//  src/components/ConfigMissingScreen.tsx
//  Pantalla amigable que se muestra cuando faltan las variables de entorno de
//  Supabase. Reemplaza la antigua "pantalla blanca" por instrucciones claras.
// ============================================================================
export function ConfigMissingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-xl rounded-2xl border border-amber-500/30 bg-slate-900 p-7 shadow-xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
          Configuracion pendiente
        </div>
        <h1 className="mb-2 text-xl font-bold text-white">
          Falta conectar Supabase
        </h1>
        <p className="mb-5 text-sm text-slate-300">
          La app arranco correctamente, pero no encuentra las credenciales de
          Supabase. Segui estos pasos:
        </p>

        <ol className="space-y-3 text-sm text-slate-200">
          <li className="flex gap-3">
            <span className="font-bold text-amber-400">1.</span>
            <span>
              En la raiz del proyecto, copia{' '}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-amber-200">
                .env.example
              </code>{' '}
              a{' '}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-amber-200">
                .env
              </code>
              .
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-amber-400">2.</span>
            <span>
              Completa{' '}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-amber-200">
                NEXT_PUBLIC_SUPABASE_URL
              </code>{' '}
              y{' '}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-amber-200">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>{' '}
              (Supabase &gt; Project Settings &gt; API).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-amber-400">3.</span>
            <span>
              <strong>Reinicia</strong>{' '}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-amber-200">
                npm run dev
              </code>
              . Next.js solo lee el archivo .env al arrancar, por eso un cambio en
              caliente no basta.
            </span>
          </li>
        </ol>

        <p className="mt-5 rounded-lg bg-slate-950 p-3 text-xs text-slate-400">
          Tip: el archivo <code className="text-slate-300">.env</code> debe estar
          en la misma carpeta que <code className="text-slate-300">package.json</code>,
          y cada variable empieza con el prefijo{' '}
          <code className="text-slate-300">NEXT_PUBLIC_</code> (obligatorio para que Next.js
          la exponga al navegador).
        </p>
      </div>
    </div>
  );
}
