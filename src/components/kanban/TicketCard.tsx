// ============================================================================
//  src/components/kanban/TicketCard.tsx
//  Tarjeta compacta del tablero. Muestra título, app, solicitante, fecha
//  y el contador "Tiempo en esta etapa". Sólo los admin pueden arrastrarla.
// ============================================================================
import { Clock, User, Paperclip, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { appBadgeClass, importanciaBadge } from "@/lib/constants";
import { fechaCorta, tiempoEnEtapa, tonoAntiguedad } from "@/lib/dates";
import type { Solicitud } from "@/types";

interface Props {
  solicitud: Solicitud;
  draggable: boolean;
  onClick: () => void;
  onDragStart: (id: string) => void;
}

export function TicketCard({
  solicitud,
  draggable,
  onClick,
  onDragStart,
}: Props) {
  const s = solicitud;
  const noViable = s.is_viable === false;

  return (
    <article
      draggable={draggable}
      onDragStart={() => onDragStart(s.id)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className={[
        "group rounded-xl border bg-white p-3.5 text-left shadow-sm transition",
        "border-slate-200 hover:border-brand-300 hover:shadow-md",
        "dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-500/50",
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        noViable ? "ring-1 ring-rose-200 dark:ring-rose-500/30" : "",
      ].join(" ")}
    >
      {/* Fila superior: app + importancia */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <Badge className={appBadgeClass(s.app_name)}>{s.app_name}</Badge>
        <Badge className={importanciaBadge(s.nivel_de_importancia)}>
          {s.nivel_de_importancia}
        </Badge>
      </div>

      {/* Título */}
      <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
        {s.titulo}
      </h3>

      {/* Aviso de no viable */}
      {noViable && (
        <p className="mb-2 flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
          <AlertCircle size={12} /> Marcado como no viable
        </p>
      )}

      {/* Pie: solicitante + adjunto + fecha + contador */}
      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
        <span className="flex min-w-0 items-center gap-1">
          <User size={12} />
          <span className="truncate">
            {s.autor?.nombre ?? s.autor?.email ?? "—"}
          </span>
          {s.url_adjunto && (
            <Paperclip size={12} className="shrink-0 text-slate-400" />
          )}
        </span>
        <span className="shrink-0">{fechaCorta(s.created_at)}</span>
      </div>

      <div className="mt-2 flex items-center gap-1 border-t border-slate-100 pt-2 dark:border-slate-700">
        <Clock size={12} className={tonoAntiguedad(s.stage_changed_at)} />
        <span
          className={[
            "text-[11px] font-medium",
            tonoAntiguedad(s.stage_changed_at),
          ].join(" ")}
        >
          {tiempoEnEtapa(s.stage_changed_at)} en esta etapa
        </span>
      </div>
    </article>
  );
}
