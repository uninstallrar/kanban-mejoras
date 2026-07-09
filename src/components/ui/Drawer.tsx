// ============================================================================
//  src/components/ui/Drawer.tsx
//  Panel lateral deslizante (derecha). Usado para el detalle del ticket y
//  el formulario de creación. Cierra con backdrop, botón o tecla Escape.
// ============================================================================
import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  // Ancho del panel (clase Tailwind). Por defecto ~ 'max-w-xl'.
  widthClass?: string;
}

export function Drawer({ open, onClose, title, children, widthClass = 'max-w-xl' }: Props) {
  // Cerrar con Escape y bloquear el scroll del fondo mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          'relative h-full w-full bg-white dark:bg-slate-900',
          'shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700',
          'flex flex-col animate-[slideIn_0.2s_ease-out]',
          widthClass,
        ].join(' ')}
      >
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
