// ============================================================================
//  src/views/RepositoryView.tsx
//  Repositorio histórico: tabla avanzada con buscador y filtros por
//  aplicación, estado y rango de fechas. Pensada para auditar tickets viejos.
// ============================================================================
import { useMemo, useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import {
  COLUMNS,
  APPS,
  STATUS_LABEL,
  appBadgeClass,
  importanciaBadge,
} from '@/lib/constants';
import { fechaCorta, tiempoEnEtapa } from '@/lib/dates';
import type { Solicitud, Status } from '@/types';

interface Props {
  solicitudes: Solicitud[];
  onCardClick: (s: Solicitud) => void;
}

export function RepositoryView({ solicitudes, onCardClick }: Props) {
  const [q, setQ] = useState('');
  const [app, setApp] = useState('todas');
  const [estado, setEstado] = useState<'todos' | Status>('todos');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const limpiarFiltros = () => {
    setQ(''); setApp('todas'); setEstado('todos'); setDesde(''); setHasta('');
  };

  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase();
    return solicitudes.filter((s) => {
      if (t && !s.titulo.toLowerCase().includes(t) && !(s.autor?.nombre ?? '').toLowerCase().includes(t)) return false;
      if (app !== 'todas' && s.app_name !== app) return false;
      if (estado !== 'todos' && s.status !== estado) return false;
      if (desde && new Date(s.created_at) < new Date(desde)) return false;
      if (hasta && new Date(s.created_at) > new Date(`${hasta}T23:59:59`)) return false;
      return true;
    });
  }, [solicitudes, q, app, estado, desde, hasta]);

  const hayFiltros = q || app !== 'todas' || estado !== 'todos' || desde || hasta;

  return (
    <div className="flex h-full flex-col">
      {/* Filtros */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar título o solicitante…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={app} onChange={(e) => setApp(e.target.value)} className="w-40">
            <option value="todas">Todas las apps</option>
            {APPS.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>

          <Select
            value={estado}
            onChange={(e) => setEstado(e.target.value as Status | 'todos')}
            className="w-48"
          >
            <option value="todos">Todos los estados</option>
            {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>

          <div className="flex items-center gap-1.5">
            <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="w-36" />
            <span className="text-slate-400">→</span>
            <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="w-36" />
          </div>

          {hayFiltros && (
            <Button variant="ghost" size="sm" onClick={limpiarFiltros}>
              <X size={14} /> Limpiar
            </Button>
          )}
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <Filter size={13} /> {filtradas.length} de {solicitudes.length} solicitudes
        </p>
      </div>

      {/* Tabla */}
      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Título</th>
              <th className="px-4 py-3 font-semibold">App</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Importancia</th>
              <th className="px-4 py-3 font-semibold">Solicitante</th>
              <th className="px-4 py-3 font-semibold">Creada</th>
              <th className="px-4 py-3 font-semibold">En etapa</th>
              <th className="px-4 py-3 font-semibold">Viable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                  No hay solicitudes que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              filtradas.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => onCardClick(s)}
                  className="cursor-pointer bg-white transition-colors hover:bg-brand-50/40 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  <td className="max-w-xs px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                    <span className="line-clamp-1">{s.titulo}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={appBadgeClass(s.app_name)}>{s.app_name}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {STATUS_LABEL[s.status]}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={importanciaBadge(s.nivel_de_importancia)}>{s.nivel_de_importancia}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {s.autor?.nombre ?? s.autor?.email ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{fechaCorta(s.created_at)}</td>
                  <td className="px-4 py-3 text-slate-500">{tiempoEnEtapa(s.stage_changed_at)}</td>
                  <td className="px-4 py-3">
                    {s.is_viable === true && <span className="text-emerald-600">Sí</span>}
                    {s.is_viable === false && <span className="text-rose-600">No</span>}
                    {s.is_viable === null && <span className="text-slate-400">—</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
