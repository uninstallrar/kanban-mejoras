// ============================================================================
//  src/types/index.ts
//  Tipos estrictos del dominio. Reflejan 1:1 el esquema de Supabase.
// ============================================================================

export type Rol =
  | "superadmin"
  | "admin"
  | "supervisor"
  | "federado"
  | "empleado"
  | "colaborador"
  | "liquidador"
  | "desarrollador"
  | "consulta"
  | "employee";

// --- Estados del Kanban ------------------------------------------------------
// El orden de este array define el orden de las columnas en el tablero.
export const STATUS_ORDER = [
  "recibido",
  "priorizado",
  "generando reporte",
  "en analisis",
  "realizando pruebas",
  "implementado",
  "rechazado",
] as const;

export type Status = (typeof STATUS_ORDER)[number];

// --- nivel de importancia ---
export type nivel_de_importancia =
  | "bajo"
  | "medio"
  | "alto"
  | "critico"
  | "a considerar a futuro";
// --- Perfil ------------------------------------------------------------------
export interface Profile {
  id: string;
  nombre: string | null;
  email: string | null;
  telefono: string | null;
  rol: Rol;
  created_at: string;
  updated_at: string;
}

// --- Solicitud (la tarjeta / ticket) ----------------------------------------
export interface Solicitud {
  id: string;
  created_at: string;
  updated_at: string;
  stage_changed_at: string;
  titulo: string;
  descripcion: string | null;
  justificacion: string | null;
  app_name: string;
  nivel_de_importancia: nivel_de_importancia;
  status: Status;
  is_viable: boolean | null;
  motivo_no_viable: string | null;
  url_adjunto: string | null;
  creado_por: string;
  // Relación expandida (join con profiles) — opcional según la consulta.
  autor?: Pick<Profile, "id" | "nombre" | "email"> | null;
}

// Payload para crear una solicitud (lo que envía el formulario).
export interface NuevaSolicitud {
  titulo: string;
  descripcion: string;
  justificacion: string;
  app_name: string;
  nivel_de_importancia: nivel_de_importancia;
  url_adjunto: string | null;
}

// --- Comentario --------------------------------------------------------------
export interface Comentario {
  id: string;
  solicitud_id: string;
  creado_por: string;
  texto: string;
  created_at: string;
  autor?: Pick<Profile, "id" | "nombre" | "email"> | null;
}

// --- Entrada del audit log ---------------------------------------------------
export interface HistorialEstado {
  id: string;
  solicitud_id: string;
  cambiado_por: string | null;
  campo: "status" | "viabilidad";
  estado_anterior: string | null;
  estado_nuevo: string | null;
  fecha_cambio: string;
  autor?: Pick<Profile, "id" | "nombre" | "email"> | null;
}
