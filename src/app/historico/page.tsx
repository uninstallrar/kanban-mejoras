"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RepositoryView } from "@/views/RepositoryView";

export default function Historico() {
  return (
    <AppShell vista="historico">
      {({ solicitudes, onCardClick }) => (
        <RepositoryView solicitudes={solicitudes} onCardClick={onCardClick} />
      )}
    </AppShell>
  );
}
