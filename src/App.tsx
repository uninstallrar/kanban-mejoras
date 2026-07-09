// ============================================================================
//  src/App.tsx
//  Componente raíz. Decide entre login y app, gestiona vista activa,
//  tema (claro/oscuro) y los drawers de creación y detalle.
// ============================================================================
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSolicitudes } from '@/hooks/useSolicitudes';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { Header, type Vista } from '@/components/layout/Header';
import { Drawer } from '@/components/ui/Drawer';
import { TicketForm } from '@/components/ticket/TicketForm';
import { TicketDetail } from '@/components/ticket/TicketDetail';
import { DashboardView } from '@/views/DashboardView';
import { RepositoryView } from '@/views/RepositoryView';
import type { Solicitud } from '@/types';

export default function App() {
  const { session, loading: authLoading } = useAuth();
  const { solicitudes, loading, recargar, setEstadoLocal } = useSolicitudes();

  const [vista, setVista] = useState<Vista>('tablero');
  const [dark, setDark] = useState(true);
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [seleccion, setSeleccion] = useState<Solicitud | null>(null);

  // Aplica/quita la clase .dark en <html> para el tema.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // Mantiene la solicitud seleccionada sincronizada con los datos frescos.
  const seleccionActual = seleccion
    ? solicitudes.find((s) => s.id === seleccion.id) ?? seleccion
    : null;

  // --- Estados de carga / sin sesión -----------------------------------------
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-sm text-slate-400">Cargando…</p>
      </div>
    );
  }

  if (!session) return <LoginScreen />;

  // --- App autenticada -------------------------------------------------------
  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header
        vista={vista}
        onVista={setVista}
        onNueva={() => setCrearAbierto(true)}
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 overflow-hidden px-4 py-5 sm:px-6">
        {vista === 'tablero' ? (
          <DashboardView
            solicitudes={solicitudes}
            loading={loading}
            onCardClick={setSeleccion}
            setEstadoLocal={setEstadoLocal}
          />
        ) : (
          <RepositoryView solicitudes={solicitudes} onCardClick={setSeleccion} />
        )}
      </main>

      {/* Drawer: nueva solicitud */}
      <Drawer
        open={crearAbierto}
        onClose={() => setCrearAbierto(false)}
        title="Nueva solicitud de mejora"
      >
        <TicketForm
          onCreada={() => {
            setCrearAbierto(false);
            recargar();
          }}
          onCancelar={() => setCrearAbierto(false)}
        />
      </Drawer>

      {/* Drawer: detalle del ticket */}
      <Drawer
        open={!!seleccionActual}
        onClose={() => setSeleccion(null)}
        title="Detalle de la solicitud"
        widthClass="max-w-2xl"
      >
        {seleccionActual && (
          <TicketDetail solicitud={seleccionActual} onActualizado={recargar} />
        )}
      </Drawer>
    </div>
  );
}
