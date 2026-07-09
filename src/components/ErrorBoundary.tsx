"use client";

// ============================================================================
//  src/components/ErrorBoundary.tsx
//  Captura cualquier error de render en el arbol de React y muestra un mensaje
//  visible en pantalla, en lugar de dejar la app en blanco. Asi, si algo falla
//  en tiempo de ejecucion, el usuario ve QUE fallo (y el detalle en consola).
// ============================================================================
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Error de render:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
          <div className="w-full max-w-lg rounded-2xl border border-red-500/30 bg-slate-900 p-6 shadow-xl">
            <h1 className="mb-2 text-lg font-bold text-red-400">
              Ocurrio un error al renderizar la app
            </h1>
            <p className="mb-4 text-sm text-slate-300">
              Esto evita la pantalla en blanco. El detalle tecnico esta en la
              consola del navegador (F12 &gt; Console).
            </p>
            <pre className="max-h-48 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-red-300">
              {this.state.error.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
