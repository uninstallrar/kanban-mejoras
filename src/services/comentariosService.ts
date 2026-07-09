// ============================================================================
//  src/services/comentariosService.ts
//  Comentarios de seguimiento (línea de tiempo interna del ticket).
// ============================================================================
import { supabase } from './supabaseClient';
import type { Comentario } from '@/types';

const SELECT_CON_AUTOR =
  '*, autor:profiles!comentarios_creado_por_fkey (id, nombre, email)';

export async function listarComentarios(
  solicitudId: string,
): Promise<Comentario[]> {
  const { data, error } = await supabase
    .from('comentarios')
    .select(SELECT_CON_AUTOR)
    .eq('solicitud_id', solicitudId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as Comentario[];
}

export async function crearComentario(
  solicitudId: string,
  creadoPor: string,
  texto: string,
): Promise<Comentario> {
  const { data, error } = await supabase
    .from('comentarios')
    .insert({ solicitud_id: solicitudId, creado_por: creadoPor, texto })
    .select(SELECT_CON_AUTOR)
    .single();

  if (error) throw error;
  return data as unknown as Comentario;
}
