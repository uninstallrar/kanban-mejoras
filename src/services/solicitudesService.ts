// ============================================================================
//  src/services/solicitudesService.ts
//  Acceso a datos de las solicitudes (tickets), historial y comentarios.
//  Nota: las restricciones de permiso se imponen por RLS en el servidor;
//  estas funciones simplemente fallan si el rol no tiene permiso.
// ============================================================================
import { supabase } from './supabaseClient';
import type {
  Solicitud,
  NuevaSolicitud,
  Status,
  HistorialEstado,
} from '@/types';

// Select reutilizable que expande el autor (join con profiles).
const SELECT_CON_AUTOR =
  '*, autor:profiles!solicitudes_creado_por_fkey (id, nombre, email)';

// --- Listar todas las solicitudes (tablero global) --------------------------
export async function listarSolicitudes(): Promise<Solicitud[]> {
  const { data, error } = await supabase
    .from('solicitudes')
    .select(SELECT_CON_AUTOR)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as Solicitud[];
}

// --- Crear una nueva solicitud ----------------------------------------------
export async function crearSolicitud(
  payload: NuevaSolicitud,
  creadoPor: string,
): Promise<Solicitud> {
  const { data, error } = await supabase
    .from('solicitudes')
    .insert({ ...payload, creado_por: creadoPor })
    .select(SELECT_CON_AUTOR)
    .single();

  if (error) throw error;
  return data as unknown as Solicitud;
}

// --- Cambiar el estado (mover en el Kanban) — sólo admin via RLS ------------
export async function cambiarEstado(
  id: string,
  nuevoStatus: Status,
): Promise<void> {
  // El trigger de la BD registra el cambio en historial_estados automáticamente.
  const { error } = await supabase
    .from('solicitudes')
    .update({ status: nuevoStatus })
    .eq('id', id);

  if (error) throw error;
}

// --- Dictaminar viabilidad — sólo admin via RLS -----------------------------
export async function dictaminarViabilidad(
  id: string,
  isViable: boolean,
  motivo: string | null,
): Promise<void> {
  const update: Partial<Solicitud> = {
    is_viable: isViable,
    motivo_no_viable: isViable ? null : motivo,
  };
  // Si se rechaza, conviene reflejarlo también en la columna del tablero.
  if (!isViable) update.status = 'rechazado';

  const { error } = await supabase
    .from('solicitudes')
    .update(update)
    .eq('id', id);

  if (error) throw error;
}

// --- Historial de cambios (audit log) de una solicitud ----------------------
export async function listarHistorial(
  solicitudId: string,
): Promise<HistorialEstado[]> {
  const { data, error } = await supabase
    .from('historial_estados')
    .select('*, autor:profiles!historial_estados_cambiado_por_fkey (id, nombre, email)')
    .eq('solicitud_id', solicitudId)
    .order('fecha_cambio', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as HistorialEstado[];
}
