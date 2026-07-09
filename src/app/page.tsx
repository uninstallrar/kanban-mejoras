"use client";

import { AppShell } from "@/components/layout/AppShell";
import { DashboardView } from "@/views/DashboardView";

export default function Home() {
  return (
    <AppShell vista="tablero">
      {({ solicitudes, loading, onCardClick, setEstadoLocal }) => (
        <DashboardView
          solicitudes={solicitudes}
          loading={loading}
          onCardClick={onCardClick}
          setEstadoLocal={setEstadoLocal}
        />
      )}
    </AppShell>
  );
}
