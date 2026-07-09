// ============================================================================
//  src/components/ticket/ViabilityPanel.tsx
//  Veredicto de viabilidad. Sólo el admin puede editar; el empleado sólo lee.
//  Si se marca "No viable", el motivo es obligatorio (se muestra al empleado).
// ============================================================================
import { useState } from 'react';
import { CheckCircle2, XCircle, Loader2, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea, Label } from '@/components/ui/Field';
import { dictaminarViabilidad } from '@/services/solicitudesService';
import type { Solicitud } from '@/types';

interface Props {
  solicitud: Solicitud;
  isAdmin: boolean;
  onActualizado: () => void;
}

export function ViabilityPanel({ solicitud, isAdmin, onActualizado }: Props) {
  const [motivo, setMotivo] = useState(solicitud.motivo_no_viable ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function dictaminar(viable: boolean) {
    setError(null);
    if (!viable && !motivo.trim()) {
      return setError('Para marcar como NO viable, indicá el motivo para el empleado.');
    }
    setBusy(true);
    try {
      await dictaminarViabilidad(solicitud.id, viable, viable ? null : motivo.trim());
      onActualizado();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el veredicto');
    } finally {
      setBusy(false);
    }
  }

  // --- Vista del veredicto ya tomado -----------------------------------------
  const Veredicto = () => {
    if (solicitud.is_viable === true) {
      return (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <CheckCircle2 size={18} /> Mejora declarada VIABLE
        </div>
      );
    }
    if (solicitud.is_viable === false) {
      return (
        <div className="rounded-lg bg-rose-50 px-3 py-2.5 dark:bg-rose-500/10">
          <p className="flex items-center gap-2 text-sm font-medium text-rose-700 dark:text-rose-400">
            <XCircle size={18} /> Mejora declarada NO VIABLE
          </p>
          {solicitud.motivo_no_viable && (
            <p className="mt-1.5 text-sm text-rose-600/90 dark:text-rose-300/80">
              <span className="font-medium">Motivo: </span>
              {solicitud.motivo_no_viable}
            </p>
          )}
        </div>
      );
    }
    return (
      <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-500 dark:bg-slate-800">
        Sin dictaminar todavía.
      </p>
    );
  };

  return (
    <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
        <Gavel size={16} className="text-brand-600" /> Veredicto de viabilidad
      </h3>

      <Veredicto />

      {/* Controles de edición: SÓLO admin */}
      {isAdmin && (
        <div className="mt-4 space-y-3">
          <div>
            <Label>Motivo (obligatorio si es no viable)</Label>
            <Textarea
              rows={2}
              placeholder="Justificación que verá el empleado…"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          )}

          <div className="flex gap-2">
            <Button variant="success" size="sm" onClick={() => dictaminar(true)} disabled={busy}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Viable
            </Button>
            <Button variant="danger" size="sm" onClick={() => dictaminar(false)} disabled={busy}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              No viable
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
