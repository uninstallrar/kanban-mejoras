// ============================================================================
//  src/hooks/useSolicitudes.ts
//  Carga las solicitudes, las mantiene en estado y se suscribe a Realtime
//  para reflejar cambios en vivo (otro admin mueve una tarjeta, etc.).
// ============================================================================
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/services/supabaseClient';
import { listarSolicitudes } from '@/services/solicitudesService';
import type { Solicitud } from '@/types';

export function useSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    try {
      setError(null);
      const data = await listarSolicitudes();
      setSolicitudes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    recargar();

    // Suscripción Realtime: cualquier INSERT/UPDATE/DELETE recarga el tablero.
    // (Recargar entero es simple y robusto; para grandes volúmenes se puede
    //  optimizar aplicando el payload incremental de cada evento.)
    const canal = supabase
      .channel('solicitudes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'solicitudes' },
        () => recargar(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [recargar]);

  // Actualización optimista local (para que el drag se sienta instantáneo).
  const setEstadoLocal = useCallback((id: string, status: Solicitud['status']) => {
    setSolicitudes((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status, stage_changed_at: new Date().toISOString() } : s,
      ),
    );
  }, []);

  return { solicitudes, loading, error, recargar, setEstadoLocal };
}
