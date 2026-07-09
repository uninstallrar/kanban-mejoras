// ============================================================================
//  src/components/kanban/KanbanColumn.tsx
//  Columna del tablero. Es zona de drop cuando el usuario es admin.
// ============================================================================
import { useState } from 'react';
import type { ColumnMeta } from '@/lib/constants';
import type { Solicitud, Status } from '@/types';
import { TicketCard } from './TicketCard';

interface Props {
  meta: ColumnMeta;
  solicitudes: Solicitud[];
  isAdmin: boolean;
  onCardClick: (s: Solicitud) => void;
  onDragStart: (id: string) => void;
  onDrop: (status: Status) => void;
}

export function KanbanColumn({
  meta,
  solicitudes,
  isAdmin,
  onCardClick,
  onDragStart,
  onDrop,
}: Props) {
  const [over, setOver] = useState(false);

  return (
    <div className="flex h-full w-80 shrink-0 flex-col">
      {/* Encabezado */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={['h-2 w-2 rounded-full', meta.dot].join(' ')} />
          <h2 className={['text-sm font-semibold', meta.accent].join(' ')}>{meta.label}</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {solicitudes.length}
        </span>
      </div>

      {/* Lista / dropzone */}
      <div
        onDragOver={(e) => {
          if (!isAdmin) return;
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={() => {
          setOver(false);
          if (isAdmin) onDrop(meta.id);
        }}
        className={[
          'flex flex-1 flex-col gap-2.5 overflow-y-auto rounded-xl p-2 transition-colors',
          'bg-slate-50/60 dark:bg-slate-900/40',
          over ? 'ring-2 ring-brand-400 ring-inset bg-brand-50/50 dark:bg-brand-500/5' : '',
        ].join(' ')}
      >
        {solicitudes.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-slate-400">Sin solicitudes</p>
        )}

        {solicitudes.map((s) => (
          <TicketCard
            key={s.id}
            solicitud={s}
            draggable={isAdmin}
            onClick={() => onCardClick(s)}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
}
