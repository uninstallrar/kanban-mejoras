// ============================================================================
//  src/lib/dates.ts
//  Helpers de fecha para el contador "Tiempo en esta etapa" y fechas legibles.
// ============================================================================

/** Días enteros transcurridos desde una fecha ISO hasta hoy. */
export function diasDesde(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

/** Etiqueta humana del tiempo en una etapa (ej. "Hoy", "3 d", "2 sem"). */
export function tiempoEnEtapa(iso: string): string {
  const d = diasDesde(iso);
  if (d === 0) return 'Hoy';
  if (d === 1) return '1 día';
  if (d < 14) return `${d} días`;
  if (d < 60) return `${Math.floor(d / 7)} sem`;
  return `${Math.floor(d / 30)} meses`;
}

/** Semáforo de antigüedad: cuanto más tiempo en una etapa, más "caliente". */
export function tonoAntiguedad(iso: string): string {
  const d = diasDesde(iso);
  if (d < 7) return 'text-slate-400';
  if (d < 21) return 'text-amber-500';
  return 'text-rose-500';
}

/** Fecha corta legible: 27 jun 2026. */
export function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Fecha + hora: 27 jun 2026, 14:30. */
export function fechaHora(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
