// ============================================================================
//  src/lib/constants.ts
//  Catálogos y metadatos visuales. Un único lugar para tunear el tablero.
// ============================================================================
import type { Status, nivel_de_importancia } from "@/types";

// --- Columnas de los tickets -
export interface ColumnMeta {
  id: Status;
  label: string;
  // Acento (texto/borde) aplicado al encabezado de la columna.
  accent: string;
  dot: string;
}

export const COLUMNS: ColumnMeta[] = [
  {
    id: "recibido",
    label: "Recibido",
    accent: "text-slate-600 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  {
    id: "priorizado",
    label: "Priorizado",
    accent: "text-blue-600 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  {
    id: "generando reporte",
    label: "Generando Reporte",
    accent: "text-indigo-600 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
  {
    id: "en analisis",
    label: "En Análisis",
    accent: "text-amber-600 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  {
    id: "realizando pruebas",
    label: "Realizando Pruebas",
    accent: "text-emerald-600 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  {
    id: "implementado",
    label: "Implementado",
    accent: "text-emerald-600 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  {
    id: "rechazado",
    label: "Rechazado / No viable",
    accent: "text-rose-600 dark:text-rose-300",
    dot: "bg-rose-500",
  },
];

export const STATUS_LABEL: Record<Status, string> = COLUMNS.reduce(
  (acc, c) => ({ ...acc, [c.id]: c.label }),
  {} as Record<Status, string>,
);

//
// SECCION PARA AGREGAR SOFTWARES EN EL DESPLEGABLE,
// también serán conocidas como "aplicaciones destino"
// cuyo destino será la modificación o adición que sugiere el usuario//

export const APPS = ["Finnegans", "FinApp", "Bitrix", "Otras"] as const;
export type AppName = (typeof APPS)[number] | string;

export const APP_BADGE: Record<string, string> = {
  Finnegans:
    "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  FinApp: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  Bitrix:
    "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  Otras: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
};

export function appBadgeClass(app: string): string {
  return APP_BADGE[app] ?? APP_BADGE["Otras"];
}

// --- Nivel de importancia | Variable -

export const IMPORTANCIAS: {
  id: nivel_de_importancia;
  label: string;
  badge: string;
}[] = [
  {
    id: "bajo",
    label: "Bajo",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  },
  {
    id: "medio",
    label: "Medio",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  },
  {
    id: "alto",
    label: "Alto",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
  {
    id: "critico",
    label: "Crítico",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  },
  {
    id: "a considerar a futuro",
    label: "A considerar a Futuro",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300",
  },
];
export function importanciaBadge(p: nivel_de_importancia): string {
  return IMPORTANCIAS.find((x) => x.id === p)?.badge ?? IMPORTANCIAS[1].badge;
}
