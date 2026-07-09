// ============================================================================
//  src/main.tsx
//  Punto de entrada. Monta React, envuelve la app con un ErrorBoundary y,
//  si faltan las credenciales de Supabase, muestra una pantalla de
//  configuracion en lugar de quedar en blanco.
// ============================================================================
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from '@/context/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ConfigMissingScreen } from '@/components/ConfigMissingScreen';
import { isSupabaseConfigured } from '@/services/supabaseClient';
import App from '@/App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {isSupabaseConfigured ? (
        <AuthProvider>
          <App />
        </AuthProvider>
      ) : (
        <ConfigMissingScreen />
      )}
    </ErrorBoundary>
  </StrictMode>,
);
