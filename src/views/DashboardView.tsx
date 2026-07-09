// ============================================================================
//  src/views/DashboardView.tsx
//  Vista principal: el tablero Kanban. Incluye un buscador rápido por título.
// ============================================================================
import { useMemo, useState } from 'react';
import { Search, Info } from 'lucide-react';
import { Input } from '@/components/ui/Field';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { useAuth } from '@/context/AuthContext';
import type { Solicitud, Status } from '@/types';

interface Props {
  solicitudes: Solicitud[];
  loading: boolean;
  onCardClick: (s: Solicitud) => void;
  setEstadoLocal: (id: string, status: Status) => void;
}

export function DashboardView({ solicitudes, loading, onCardClick, setEstadoLocal }: Props) {
  const { isAdmin } = useAuth();
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);

  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return solicitudes;
    return solicitudes.filter(
      (s) =>
        s.titulo.toLowerCase().includes(t) ||
        s.app_name.toLowerCase().includes(t) ||
        (s.autor?.nombre ?? '').toLowerCase().includes(t),
    );
  }, [solicitudes, q]);

  return (
    <div className="flex h-full flex-col">
      {/* Barra de herramientas */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por título, app o solicitante…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>

        {!isAdmin && (
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Info size={14} /> Modo lectura: podés crear y comentar, pero no mover tarjetas.
          </span>
        )}
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </p>
      )}

      {/* Tablero */}
      <div className="min-h-0 flex-1">
        {loading ? (
          <p className="py-12 text-center text-sm text-slate-400">Cargando tablero…</p>
        ) : (
          <KanbanBoard
            solicitudes={filtradas}
            onCardClick={onCardClick}
            setEstadoLocal={setEstadoLocal}
            onError={setError}
          />
        )}
      </div>
    </div>
  );
}
