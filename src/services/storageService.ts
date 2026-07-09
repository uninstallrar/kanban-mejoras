// ============================================================================
//  src/services/storageService.ts
//  Subida de adjuntos (capturas, PDFs, excels) a Supabase Storage.
//Esta parte ya está configurada en supabase > storage > buckets > adjuntos
// ============================================================================
import { supabase, STORAGE_BUCKET } from "./supabaseClient";

/**
 * Sube un archivo al bucket de adjuntos y devuelve su URL pública.
 * La ruta incluye el id de usuario para mantener orden y trazabilidad.
 */
export async function subirAdjunto(
  file: File,
  userId: string,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const nombre = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(nombre, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(nombre);
  return data.publicUrl;
}
