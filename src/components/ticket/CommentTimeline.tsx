// ============================================================================
//  src/components/ticket/CommentTimeline.tsx
//  Línea de tiempo interna: fusiona comentarios y cambios del audit log,
//  ordenados cronológicamente. Cualquier usuario puede comentar.
// ============================================================================
import { useEffect, useMemo, useState } from 'react';
import { MessageSquarePlus, Loader2, ArrowRight, GitCommitHorizontal, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Field';
import { STATUS_LABEL } from '@/lib/constants';
import { fechaHora } from '@/lib/dates';
import { listarComentarios, crearComentario } from '@/services/comentariosService';
import { listarHistorial } from '@/services/solicitudesService';
import { useAuth } from '@/context/AuthContext';
import type { Comentario, HistorialEstado, Status } from '@/types';

interface Props {
  solicitudId: string;
  // Cambia cuando el ticket se actualiza, para refrescar el historial.
  refreshKey: number;
}

// Entrada unificada de la línea de tiempo.
type Evento =
  | { tipo: 'comentario'; fecha: string; data: Comentario }
  | { tipo: 'cambio'; fecha: string; data: HistorialEstado };

function etiquetaEstado(valor: string | null): string {
  if (!valor) return '—';
  return STATUS_LABEL[valor as Status] ?? valor;
}

export function CommentTimeline({ solicitudId, refreshKey }: Props) {
  const { session } = useAuth();
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [historial, setHistorial] = useState<HistorialEstado[]>([]);
  const [texto, setTexto] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function cargar() {
    setLoading(true);
    const [c, h] = await Promise.all([
      listarComentarios(solicitudId),
      listarHistorial(solicitudId),
    ]);
    setComentarios(c);
    setHistorial(h);
    setLoading(false);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitudId, refreshKey]);

  // Fusiona y ordena cronológicamente (más reciente arriba).
  const eventos = useMemo<Evento[]>(() => {
    const evs: Evento[] = [
      ...comentarios.map((c) => ({ tipo: 'comentario' as const, fecha: c.created_at, data: c })),
      ...historial.map((h) => ({ tipo: 'cambio' as const, fecha: h.fecha_cambio, data: h })),
    ];
    return evs.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [comentarios, historial]);

  async function enviar() {
    if (!texto.trim() || !session?.user) return;
    setBusy(true);
    try {
      await crearComentario(solicitudId, session.user.id, texto.trim());
      setTexto('');
      await cargar();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
        Seguimiento e historial
      </h3>

      {/* Caja de comentario */}
      <div className="mb-4">
        <Textarea
          rows={2}
          placeholder="Dejá una nota de seguimiento, link de documentación o consulta…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={enviar} disabled={busy || !texto.trim()}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <MessageSquarePlus size={14} />}
            Comentar
          </Button>
        </div>
      </div>

      {/* Línea de tiempo */}
      {loading ? (
        <p className="py-4 text-center text-sm text-slate-400">Cargando historial…</p>
      ) : eventos.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">Sin actividad todavía.</p>
      ) : (
        <ol className="space-y-3 border-l border-slate-200 pl-4 dark:border-slate-700">
          {eventos.map((ev) =>
            ev.tipo === 'comentario' ? (
              <li key={`c-${ev.data.id}`} className="relative">
                <span className="absolute -left-[1.4rem] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-600/20 dark:text-brand-300">
                  <MessageCircle size={11} />
                </span>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      {ev.data.autor?.nombre ?? ev.data.autor?.email ?? 'Usuario'}
                    </span>
                    <span className="text-[11px] text-slate-400">{fechaHora(ev.data.created_at)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                    {ev.data.texto}
                  </p>
                </div>
              </li>
            ) : (
              <li key={`h-${ev.data.id}`} className="relative">
                <span className="absolute -left-[1.4rem] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                  <GitCommitHorizontal size={11} />
                </span>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {ev.data.autor?.nombre ?? 'Sistema'}
                  </span>
                  {ev.data.campo === 'status' ? (
                    <>
                      <span>movió de</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-700">
                        {etiquetaEstado(ev.data.estado_anterior)}
                      </span>
                      <ArrowRight size={12} />
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-700">
                        {etiquetaEstado(ev.data.estado_nuevo)}
                      </span>
                    </>
                  ) : (
                    <span>
                      cambió la viabilidad a{' '}
                      <span className="font-medium">{ev.data.estado_nuevo}</span>
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">· {fechaHora(ev.data.fecha_cambio)}</span>
                </div>
              </li>
            ),
          )}
        </ol>
      )}
    </section>
  );
}
