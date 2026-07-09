// ============================================================================
//  src/components/ticket/TicketDetail.tsx
//  Contenido del drawer de detalle del ticket. Ensambla:
//   - cabecera (app, importancia, solicitante, adjunto)
//   - selector de estado (sólo admin)
//   - panel de viabilidad
//   - línea de tiempo (comentarios + audit log)
// ============================================================================
import { useState } from 'react';
import { Paperclip, CalendarDays, User } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Field';
import { COLUMNS, appBadgeClass, importanciaBadge } from '@/lib/constants';
import { fechaCorta } from '@/lib/dates';
import { cambiarEstado } from '@/services/solicitudesService';
import { useAuth } from '@/context/AuthContext';
import type { Solicitud, Status } from '@/types';
import { ViabilityPanel } from './ViabilityPanel';
import { CommentTimeline } from './CommentTimeline';

interface Props {
  solicitud: Solicitud;
  onActualizado: () => void;
}

export function TicketDetail({ solicitud, onActualizado }: Props) {
  const { isAdmin } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  function refrescar() {
    setRefreshKey((k) => k + 1);
    onActualizado();
  }

  async function cambiarStatus(nuevo: Status) {
    await cambiarEstado(solicitud.id, nuevo);
    refrescar();
  }

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge className={appBadgeClass(solicitud.app_name)}>{solicitud.app_name}</Badge>
          <Badge className={importanciaBadge(solicitud.nivel_de_importancia)}>
            Importancia {solicitud.nivel_de_importancia}
          </Badge>
        </div>
        <h2 className="text-lg font-semibold leading-snug text-slate-900 dark:text-slate-100">
          {solicitud.titulo}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <User size={13} /> {solicitud.autor?.nombre ?? solicitud.autor?.email ?? '—'}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays size={13} /> Creada el {fechaCorta(solicitud.created_at)}
          </span>
        </div>
      </div>

      {/* Estado: admin lo cambia con un select; empleado lo ve como badge */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Estado:</span>
        {isAdmin ? (
          <Select
            value={solicitud.status}
            onChange={(e) => cambiarStatus(e.target.value as Status)}
            className="max-w-xs"
          >
            {COLUMNS.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </Select>
        ) : (
          <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
            {COLUMNS.find((c) => c.id === solicitud.status)?.label}
          </Badge>
        )}
      </div>

      {/* Descripción y justificación */}
      {solicitud.descripcion && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Descripción
          </p>
          <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
            {solicitud.descripcion}
          </p>
        </div>
      )}
      {solicitud.justificacion && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Justificación del impacto
          </p>
          <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
            {solicitud.justificacion}
          </p>
        </div>
      )}

      {/* Adjunto */}
      {solicitud.url_adjunto && (
        <a
          href={solicitud.url_adjunto}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-brand-600 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <Paperclip size={15} /> Ver archivo adjunto
        </a>
      )}

      <ViabilityPanel solicitud={solicitud} isAdmin={isAdmin} onActualizado={refrescar} />

      <CommentTimeline solicitudId={solicitud.id} refreshKey={refreshKey} />
    </div>
  );
}
