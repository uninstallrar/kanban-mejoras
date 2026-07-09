// ============================================================================
//  src/components/ui/Field.tsx
//  Inputs estilizados y consistentes para todos los formularios.
// ============================================================================
import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
} from 'react';

const base =
  'w-full rounded-lg border border-slate-300 dark:border-slate-600 ' +
  'bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 ' +
  'placeholder:text-slate-400 focus:border-brand-500 focus:outline-none ' +
  'focus:ring-2 focus:ring-brand-500/30 transition';

export function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  );
}

export function Field({ children }: { children: ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={[base, props.className].join(' ')} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={[base, 'resize-y', props.className].join(' ')} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={[base, props.className].join(' ')} />;
}
