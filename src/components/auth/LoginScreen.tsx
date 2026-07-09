// ============================================================================
//  src/components/auth/LoginScreen.tsx
//  Pantalla de acceso. Dos métodos: Google OAuth y OTP por SMS (sin password).
//  Flujo OTP en dos pasos: (1) enviar código, (2) verificar código.
// ============================================================================
import { useState } from "react";
import { KanbanSquare, Smartphone, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import {
  signInWithGoogle,
  sendPhoneOtp,
  verifyPhoneOtp,
} from "@/services/authService";
import { GoogleOAuthProvider } from "@react-oauth/google";

//CONFIGURACION PARA INTEGRAR INICIO CON NUMERO DE TELÉFONO

export function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo iniciar con Google",
      );
    }
  }

  async function handleSendOtp() {
    if (!phone.trim()) return setError("Ingresá tu número de teléfono.");
    setBusy(true);
    setError(null);
    try {
      await sendPhoneOtp(phone.trim());
      setStep("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar el código");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify() {
    if (!token.trim()) return setError("Ingresá el código que recibiste.");
    setBusy(true);
    setError(null);
    try {
      await verifyPhoneOtp(phone.trim(), token.trim());
      // El AuthProvider detecta el cambio de sesión automáticamente.
    } catch (e) {
      setError(e instanceof Error ? e.message : "Código inválido");
    } finally {
      setBusy(false);
    }
  }
  //CONFIGURACION DE GOOGLE:

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md">
          {/* Marca */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
              <KanbanSquare size={28} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Sistema de Mejoras
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gestión y seguimiento de demandas internas
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Google */}
            <button
              onClick={handleGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <GoogleIcon />
              Iniciar sesión con Google
            </button>

            {/* Separador */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs font-medium text-slate-400">
                o por teléfono
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* OTP por teléfono */}
            {step === "phone" ? (
              <div>
                <Label>Número de teléfono</Label>
                <div className="flex items-center gap-2">
                  <span className="flex h-10 items-center rounded-lg bg-slate-100 px-3 text-slate-400 dark:bg-slate-800">
                    <Smartphone size={16} />
                  </span>
                  <Input
                    type="tel"
                    inputMode="tel"
                    placeholder="+54 9 11 2233 4455"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Formato internacional (E.164). Recibirás un código por SMS.
                </p>
                <Button
                  className="mt-4 w-full"
                  onClick={handleSendOtp}
                  disabled={busy}
                >
                  {busy ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                  Enviar código
                </Button>
              </div>
            ) : (
              <div>
                <Label>Código de verificación</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  className="text-center text-lg tracking-[0.5em]"
                />
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Enviado a {phone}.{" "}
                  <button
                    className="font-medium text-brand-600 hover:underline"
                    onClick={() => {
                      setStep("phone");
                      setToken("");
                    }}
                  >
                    Cambiar número
                  </button>
                </p>
                <Button
                  className="mt-4 w-full"
                  onClick={handleVerify}
                  disabled={busy}
                >
                  {busy ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                  Verificar e ingresar
                </Button>
              </div>
            )}

            {error && (
              <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                {error}
              </p>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Acceso exclusivo para personal de la empresa.
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

// Logo de Google en SVG (evita dependencias externas).
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
