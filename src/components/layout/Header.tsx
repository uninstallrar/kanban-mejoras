// ============================================================================
//  src/components/layout/Header.tsx
//  Barra superior: marca, navegación (Tablero / Histórico), botón de creación,
//  toggle de tema, identidad del usuario y su rol, y cerrar sesión.
// ============================================================================
import { KanbanSquare, Archive, Plus, Moon, Sun, LogOut, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export type Vista = 'tablero' | 'historico';

interface Props {
  vista: Vista;
  onVista: (v: Vista) => void;
  onNueva: () => void;
  dark: boolean;
  onToggleDark: () => void;
}

export function Header({ vista, onVista, onNueva, dark, onToggleDark }: Props) {
  const { profile, isAdmin, signOut } = useAuth();

  const navBtn = (activo: boolean) =>
    [
      'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      activo
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-300'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
    ].join(' ');

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
        {/* Marca */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <KanbanSquare size={20} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Mejoras</p>
            <p className="text-[11px] text-slate-400">Panel de demandas</p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="ml-2 hidden items-center gap-1 sm:flex">
          <button className={navBtn(vista === 'tablero')} onClick={() => onVista('tablero')}>
            <KanbanSquare size={16} /> Tablero
          </button>
          <button className={navBtn(vista === 'historico')} onClick={() => onVista('historico')}>
            <Archive size={16} /> Histórico
          </button>
        </nav>

        <div className="flex-1" />

        {/* Acciones */}
        <Button size="sm" onClick={onNueva}>
          <Plus size={16} /> Nueva solicitud
        </Button>

        <button
          onClick={onToggleDark}
          aria-label="Cambiar tema"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Identidad + rol */}
        <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-700 md:flex">
          <div className="text-right leading-tight">
            <p className="max-w-[160px] truncate text-sm font-medium text-slate-800 dark:text-slate-200">
              {profile?.nombre ?? profile?.email ?? 'Usuario'}
            </p>
            <p
              className={[
                'inline-flex items-center gap-1 text-[11px] font-medium',
                isAdmin ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400',
              ].join(' ')}
            >
              {isAdmin ? <ShieldCheck size={12} /> : <User size={12} />}
              {profile?.rol ? (
                ({
                  superadmin: 'Superadmin',
                  admin: 'Administrador',
                  supervisor: 'Supervisor',
                  federado: 'Usuario Federado',
                  empleado: 'Empleado',
                  colaborador: 'Colaborador',
                  liquidador: 'Liquidador',
                  desarrollador: 'Desarrollador',
                  consulta: 'Consulta',
                  employee: 'Empleado',
                } as Record<string, string>)[profile.rol] || profile.rol
              ) : (
                isAdmin ? 'Administrador' : 'Empleado'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          aria-label="Cerrar sesión"
          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
