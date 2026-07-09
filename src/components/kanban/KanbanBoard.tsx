// ============================================================================
//  src/components/kanban/KanbanBoard.tsx
//  Orquesta las columnas y el drag & drop. Al soltar una tarjeta:
//   1) actualiza el estado local (optimista),
//   2) persiste en Supabase (sólo admin lo logra, por RLS),
//   3) el trigger de la BD registra el cambio en el audit log.
// ============================================================================
import { useRef, useState } from 'react';
import { COLUMNS } from '@/lib/constants';
import { cambiarEstado } from '@/services/solicitudesService';
import type { Solicitud, Status } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { KanbanColumn } from './KanbanColumn';

interface Props {
  solicitudes: Solicitud[];
  onCardClick: (s: Solicitud) => void;
  setEstadoLocal: (id: string, status: Status) => void;
  onError: (msg: string) => void;
}

export function KanbanBoard({ solicitudes, onCardClick, setEstadoLocal, onError }: Props) {
  const { isAdmin } = useAuth();
  const draggedId = useRef<string | null>(null);
  const [moviendo, setMoviendo] = useState(false);

  function handleDragStart(id: string) {
    draggedId.current = id;
  }

  async function handleDrop(nuevoStatus: Status) {
    const id = draggedId.current;
    draggedId.current = null;
    if (!id) return;

    const actual = solicitudes.find((s) => s.id === id);
    if (!actual || actual.status === nuevoStatus) return;

    const anterior = actual.status;
    setEstadoLocal(id, nuevoStatus); // optimista
    setMoviendo(true);
    try {
      await cambiarEstado(id, nuevoStatus);
    } catch (e) {
      setEstadoLocal(id, anterior); // revertir si falla (p. ej. sin permiso)
      onError(e instanceof Error ? e.message : 'No se pudo mover la tarjeta');
    } finally {
      setMoviendo(false);
    }
  }

  // Agrupa solicitudes por estado para repartir entre columnas.
  const porColumna = (status: Status) =>
    solicitudes.filter((s) => s.status === status);

  return (
    <div className="relative h-full">
      {moviendo && (
        <div className="absolute right-2 top-0 z-10 rounded-full bg-brand-600 px-3 py-1 text-xs text-white shadow">
          Guardando…
        </div>
      )}
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((meta) => (
          <KanbanColumn
            key={meta.id}
            meta={meta}
            solicitudes={porColumna(meta.id)}
            isAdmin={isAdmin}
            onCardClick={onCardClick}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}
