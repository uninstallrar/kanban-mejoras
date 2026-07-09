// ============================================================================
//  src/components/ui/Badge.tsx
//  Etiqueta compacta de color. Las clases de color llegan por prop.
// ============================================================================
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className = '' }: Props) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5',
        'text-xs font-medium whitespace-nowrap',
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
