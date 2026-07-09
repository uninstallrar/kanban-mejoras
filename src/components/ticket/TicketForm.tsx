// ============================================================================
//  src/components/ticket/TicketForm.tsx
//  Formulario de creación de solicitudes. Disponible para cualquier usuario.
//  Incluye carga de adjunto a Supabase Storage (capturas, PDFs, excels).
// ============================================================================
import { useRef, useState } from "react";
import { Loader2, UploadCloud, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Label, Input, Textarea, Select } from "@/components/ui/Field";
import { APPS, IMPORTANCIAS } from "@/lib/constants";
import { crearSolicitud } from "@/services/solicitudesService";
import { subirAdjunto } from "@/services/storageService";
import { useAuth } from "@/context/AuthContext";
import type { nivel_de_importancia } from "@/types";

interface Props {
  onCreada: () => void;
  onCancelar: () => void;
}

export function TicketForm({ onCreada, onCancelar }: Props) {
  const { session } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState("");
  const [appName, setAppName] = useState<string>(APPS[0]);
  const [otraApp, setOtraApp] = useState("");
  const [importancia, setImportancia] = useState<nivel_de_importancia>("medio");
  const [descripcion, setDescripcion] = useState("");
  const [justificacion, setJustificacion] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!titulo.trim())
      return setError("Es necesario que le agregues un título a la solicitud.");
    if (!descripcion.trim())
      return setError("No estás dejando información sobre tu solicitud.");
    if (!session?.user) return setError("Sesión no válida.");

    const appFinal =
      appName === "Otras" && otraApp.trim() ? otraApp.trim() : appName;

    setBusy(true);
    try {
      // 1) Subir adjunto si lo hay.
      let url: string | null = null;
      if (file) url = await subirAdjunto(file, session.user.id);

      // 2) Crear la solicitud.
      await crearSolicitud(
        {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          justificacion: justificacion.trim(),
          app_name: appFinal,
          nivel_de_importancia: importancia,
          url_adjunto: url,
        },
        session.user.id,
      );

      onCreada();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo crear la solicitud",
      );
    } finally {
      setBusy(false);
    }
  }

 return (
  <div>
    <Field>
      <Label required>Título</Label>
      <Input
        placeholder="Ej: Agregar exportación a Excel en el reporte de cobros"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        maxLength={120}
      />
    </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <Label required>Aplicación destino</Label>
          <Select value={appName} onChange={(e) => setAppName(e.target.value)}>
            {APPS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </Field>

        <Field>
          {/* Si realmente es importante, tambien nos puede llegar a chupar un huevo. */}
          <Label required>Nivel de importancia</Label>
          <Select
            value={importancia}
            onChange={(e) =>
              setImportancia(e.target.value as nivel_de_importancia)
            }
          >
            {IMPORTANCIAS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {appName === "Otras" && (
        <Field>
          <Label>¿Cuál es la aplicación?</Label>
          <Input
            placeholder="Nombre de la aplicación"
            value={otraApp}
            onChange={(e) => setOtraApp(e.target.value)}
          />
        </Field>
      )}

      <Field>
        <Label required>Info</Label>
        <Textarea
          rows={4}
          placeholder="Describí con detalle qué necesitás y por qué."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </Field>

      <Field>
        <Label>Justificación del impacto</Label>
        <Textarea
          rows={3}
          placeholder="¿A quién beneficia y qué problema resuelve este cambio?"
          value={justificacion}
          onChange={(e) => setJustificacion(e.target.value)}
        />
      </Field>

      {/* Adjunto */}
      <Field>
        <Label>Adjuntar archivo o captura</Label>
        {!file ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 transition hover:border-brand-400 hover:bg-brand-50/40 dark:border-slate-600 dark:bg-slate-800/50 dark:hover:border-brand-500"
          >
            <UploadCloud size={22} />
            <span>
              Hacé clic para subir{" "}
              <span className="text-slate-400">(imagen, PDF o Excel)</span>
            </span>
          </button>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800">
            <span className="flex min-w-0 items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <FileText size={16} className="shrink-0 text-brand-600" />
              <span className="truncate">{file.name}</span>
            </span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="rounded p-1 text-slate-400 hover:text-rose-500"
              aria-label="Quitar archivo"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf,.xlsx,.xls,.csv,.doc,.docx"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </Field>

      {error && (
        <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
        <Button variant="ghost" onClick={onCancelar} disabled={busy}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={busy}>
          {busy && <Loader2 size={16} className="animate-spin" />}
          Enviar
        </Button>
      </div>
    </div>
  );
}
