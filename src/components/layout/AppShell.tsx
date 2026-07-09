"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSolicitudes } from "@/hooks/useSolicitudes";
import { Header, type Vista } from "@/components/layout/Header";
import { Drawer } from "@/components/ui/Drawer";
import { TicketForm } from "@/components/ticket/TicketForm";
import { TicketDetail } from "@/components/ticket/TicketDetail";
import { LoginScreen } from "@/components/auth/LoginScreen";
import type { Solicitud, Status } from "@/types";

interface ShellProps {
  vista: Vista;
  children: (props: {
    solicitudes: Solicitud[];
    loading: boolean;
    onCardClick: (s: Solicitud) => void;
    setEstadoLocal: (id: string, status: Status) => void;
  }) => ReactNode;
}

export function AppShell({ vista, children }: ShellProps) {
  const { session, loading: authLoading } = useAuth();
  const { theme, setTheme, coverPhoto } = useTheme();
  const { solicitudes, loading, recargar, setEstadoLocal } = useSolicitudes();
  const router = useRouter();

  const [crearAbierto, setCrearAbierto] = useState(false);
  const [seleccion, setSeleccion] = useState<Solicitud | null>(null);

  // Mantiene la solicitud seleccionada sincronizada con los datos frescos.
  const seleccionActual = seleccion
    ? solicitudes.find((s) => s.id === seleccion.id) ?? seleccion
    : null;

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">Iniciando sesión…</p>
        </div>
      </div>
    );
  }

  if (!session) return <LoginScreen />;

  // Clases CSS dinámicas para cada uno de los 3 temas
  let themeBgClass = "";
  if (theme === "corporativo") {
    // Tema 1: Blanco hueso, crema, beiges, arena
    themeBgClass = "bg-[#FAF8F5] text-slate-800 font-serif"; 
  } else if (theme === "recursos-humanos") {
    // Tema 2: Cálido, enfocado en personas, fondo durazno/rosa muy suave
    themeBgClass = "bg-[#FFF6F0] text-slate-900";
  } else {
    // Tema 3: Lobo Negro - Oscuro premium, negros profundos, gris carbón
    themeBgClass = "bg-[#09090B] text-zinc-100 dark";
  }

  return (
    <div className={`flex h-screen flex-col overflow-hidden transition-colors duration-300 ${themeBgClass}`}>
      
      {/* Portada personalizada de cabecera para el Tema 2 (Recursos Humanos) */}
      {theme === "recursos-humanos" && (
        <div 
          className="relative h-28 w-full bg-gradient-to-r from-orange-400 via-rose-400 to-amber-300 bg-cover bg-center shrink-0 shadow-sm"
          style={coverPhoto ? { backgroundImage: `url(${coverPhoto})` } : undefined}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute bottom-2 left-6 text-white text-xs font-semibold drop-shadow-md bg-black/30 px-2.5 py-1 rounded-md">
            Espacio de Gestión Humana
          </div>
        </div>
      )}

      <Header
        vista={vista}
        onVista={(v) => {
          if (v === "tablero") {
            router.push("/");
          } else if (v === "historico") {
            router.push("/historico");
          }
        }}
        onNueva={() => setCrearAbierto(true)}
        dark={theme === "lobo-negro"}
        onToggleDark={() => {
          if (theme === "lobo-negro") {
            setTheme("corporativo");
          } else if (theme === "corporativo") {
            setTheme("recursos-humanos");
          } else {
            setTheme("lobo-negro");
          }
        }}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 overflow-hidden px-4 py-5 sm:px-6 flex flex-col min-h-0">
        {children({
          solicitudes,
          loading,
          onCardClick: setSeleccion,
          setEstadoLocal,
        })}
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
